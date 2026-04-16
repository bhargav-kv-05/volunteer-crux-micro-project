import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/mongodb";
import Event from "@/models/Event";
import User from "@/models/User";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        // 1. Auth Check: Must be NGO or Admin
        if (!session || !session.user || (session.user.role !== "ngo" && session.user.role !== "admin")) {
            return NextResponse.json({ message: "Unauthorized. NGO or Admin access only." }, { status: 403 });
        }

        const { eventId, volunteerId, attended } = await req.json();

        if (!eventId || !volunteerId) {
            return NextResponse.json({ message: "Missing fields" }, { status: 400 });
        }

        await connectToDatabase();

        const event = await Event.findById(eventId);
        if (!event) {
            return NextResponse.json({ message: "Event not found" }, { status: 404 });
        }

        // 2. Ownership Check: Only the organizer or admin can mark attendance
        // Note: converting to string for comparison is safer with MongoDB ObjectIds
        if (event.organizer.toString() !== session.user.id && session.user.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized. You are not the organizer." }, { status: 403 });
        }

        // 3. Update Logic
        const attendeesSet = new Set(event.attendees.map((id: any) => id.toString()));
        const isAlreadyAttended = attendeesSet.has(volunteerId);

        if (attended && !isAlreadyAttended) {
            // Mark present: Add to list + Award Points
            attendeesSet.add(volunteerId);
            await User.findByIdAndUpdate(volunteerId, { $inc: { points: 10 } });
        } else if (!attended && isAlreadyAttended) {
            // Mark absent: Remove from list - Deduct Points
            attendeesSet.delete(volunteerId);

            // Safe Deduct: Only deduct if user has >= 10 points to avoid negative debt spirals
            // This also fixes the "Desync" issue where a user might be verified but have 0 points.
            await User.updateOne(
                { _id: volunteerId, points: { $gte: 10 } },
                { $inc: { points: -10 } }
            );
        }

        event.attendees = Array.from(attendeesSet);
        await event.save();

        return NextResponse.json({
            message: "Attendance updated",
            attendees: event.attendees
        });

    } catch (error) {
        console.error("Attendance Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

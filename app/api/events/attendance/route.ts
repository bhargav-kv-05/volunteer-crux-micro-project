import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/mongodb";
import Event from "@/models/Event";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        // 1. Auth Check: Must be NGO
        if (!session || !session.user || session.user.role !== "ngo") {
            return NextResponse.json({ message: "Unauthorized. NGO access only." }, { status: 403 });
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

        // 2. Ownership Check: Only the organizer can mark attendance
        // Note: converting to string for comparison is safer with MongoDB ObjectIds
        if (event.organizer.toString() !== session.user.id) {
            return NextResponse.json({ message: "Unauthorized. You are not the organizer." }, { status: 403 });
        }

        // 3. Update Logic
        const attendeesSet = new Set(event.attendees.map((id: any) => id.toString()));

        if (attended) {
            attendeesSet.add(volunteerId);
        } else {
            attendeesSet.delete(volunteerId);
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

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/lib/mongodb";
import Event from "@/models/Event";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        // Check for session and user ID
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { eventId } = await req.json();

        if (!eventId) {
            return NextResponse.json({ message: "Event ID is required" }, { status: 400 });
        }

        await connectToDatabase();

        const event = await Event.findById(eventId);

        if (!event) {
            return NextResponse.json({ message: "Event not found" }, { status: 404 });
        }

        // Matchmaking Logic: You cannot enter the applicant pool if the algorithm has already drafted the team
        if (event.matchmakingRun) {
            return NextResponse.json({ message: "Team formation has already concluded for this event!" }, { status: 400 });
        }

        // Check if user is already a volunteer using robust string comparison
        const isAlreadyJoined = event.volunteers.some(
            (volunteerId: any) => volunteerId.toString() === session.user.id
        );

        if (isAlreadyJoined) {
            return NextResponse.json({ message: "You have already joined this event" }, { status: 400 });
        }

        // Add user ID to applicant pool
        event.volunteers.push(session.user.id);
        
        // Optimistically increment the tracker so the frontend sees the applicant count
        event.filled += 1;
        await event.save();

        return NextResponse.json({ message: "Entered Applicant Pool! Awaiting Algorithm Selection." }, { status: 200 });

    } catch (error) {
        console.error("Error joining event:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
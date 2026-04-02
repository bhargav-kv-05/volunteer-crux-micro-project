import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/mongodb";
import Event from "@/models/Event";
import User from "@/models/User"; // Ensure User model is registered

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const params = await props.params;
        const { id } = params;

        await connectToDatabase();

        // Find event
        const event = await Event.findById(id).populate("volunteers", "name email image");

        if (!event) {
            return NextResponse.json({ message: "Event not found" }, { status: 404 });
        }

        // Security: Only organizer can see the full roster
        if (event.organizer.toString() !== session.user.id) {
            return NextResponse.json({ message: "Unauthorized: You are not the organizer." }, { status: 403 });
        }

        return NextResponse.json({
            event: {
                _id: event._id,
                title: event.title,
                date: event.date,
                attendees: event.attendees, // Return attendees list to check status
                draftedTeam: event.draftedTeam,
                matchmakingRun: event.matchmakingRun,
                spots: event.spots,
                skills: event.skills,
                squads: event.squads 
            },
            volunteers: event.volunteers
        });

    } catch (error) {
        console.error("Roster Fetch Error:", error);
        return NextResponse.json({ message: "Error fetching roster" }, { status: 500 });
    }
}

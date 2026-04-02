import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/mongodb";
import Event from "@/models/Event";
import User from "@/models/User";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ngo") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();

        const { squadSize } = await req.json();

        // Find the event and fully populate the draftedTeam so we can access their underlying skills natively
        const event = await Event.findById(id).populate({
            path: 'draftedTeam',
            model: User,
            select: 'name email skills'
        });

        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        if (event.organizer.toString() !== session.user.id) {
            return NextResponse.json({ error: "Unauthorized to manage this event" }, { status: 401 });
        }

        if (!event.draftedTeam || event.draftedTeam.length === 0) {
            return NextResponse.json({ error: "No finalized team drafted yet to split into squads." }, { status: 400 });
        }

        // 1. Determine optimal squad size mathematically based on User limits or Auto-Fallback
        const totalVolunteers = event.draftedTeam.length;
        let finalSquadSize = squadSize;

        if (!finalSquadSize || finalSquadSize <= 0) {
            // Auto-calculate best size (3, 4, or 5) trying to minimize uneven remainders
            if (totalVolunteers % 5 === 0) finalSquadSize = 5;
            else if (totalVolunteers % 4 === 0) finalSquadSize = 4;
            else if (totalVolunteers % 3 === 0) finalSquadSize = 3;
            else {
                // If it doesn't divide perfectly, heavily default to 5-person squads structurally
                finalSquadSize = 5; 
            }
        }

        const numSquads = Math.ceil(totalVolunteers / finalSquadSize);

        // 2. Initialize Empty Squad Matrices
        const squads: { name: string; members: string[]; totalSkills: number }[] = Array.from({ length: numSquads }, (_, i) => ({
            name: `Squad ${String.fromCharCode(65 + i)}`, // e.g. Squad A, Squad B
            members: [],
            totalSkills: 0
        }));

        // 3. The Balancing Algorithm: Sort volunteers natively by strictly who has the most diverse skillset first!
        const volunteers = [...event.draftedTeam];
        volunteers.sort((a, b) => (b.skills?.length || 0) - (a.skills?.length || 0));

        // 4. Distribute volunteers into squads greedily based on size and current skill saturation matrix
        for (const volunteer of volunteers) {
            // Find the squad that currently formally has the FEWEST members. 
            // If completely tied, find the squad with the FEWEST total overlapping skills to deeply balance experience natively.
            let bestSquadIndex = 0;
            
            for (let i = 1; i < squads.length; i++) {
                if (squads[i].members.length < squads[bestSquadIndex].members.length) {
                    bestSquadIndex = i;
                } else if (
                    squads[i].members.length === squads[bestSquadIndex].members.length &&
                    squads[i].totalSkills < squads[bestSquadIndex].totalSkills
                ) {
                    bestSquadIndex = i;
                }
            }

            squads[bestSquadIndex].members.push(volunteer._id.toString());
            squads[bestSquadIndex].totalSkills += (volunteer.skills?.length || 0);
        }

        // 5. Explicitly map arrays into the Mongoose Event Model format
        event.squads = squads.map(s => ({
            name: s.name,
            members: s.members
        }));

        await event.save();

        return NextResponse.json({ 
            message: "Mathematically balanced Squads successfully generated!", 
            squads: event.squads 
        });

    } catch (error) {
        console.error("Squad Generation Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

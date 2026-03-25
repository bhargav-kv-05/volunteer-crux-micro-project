import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/lib/mongodb";
import Event from "@/models/Event";
import User from "@/models/User";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        // Security check: must be NGO
        if (!session || session.user.role !== "ngo") {
            return NextResponse.json({ message: "Unauthorized. Only NGOs can run Matchmaking." }, { status: 401 });
        }

        await connectToDatabase();
        
        const params = await props.params;

        // Find the event and explicitly populate the volunteers (applicants) to access their skills array
        const event = await Event.findById(params.id).populate({
            path: 'volunteers',
            model: User,
            select: '_id skills'
        });

        if (!event) {
            return NextResponse.json({ message: "Event not found" }, { status: 404 });
        }

        // Security: ensure the explicit person running this is the verified organizer of this specific event
        if (event.organizer.toString() !== session.user.id) {
            return NextResponse.json({ message: "You are not authorized to matchmake this event." }, { status: 403 });
        }

        // Prevent Double-Drafting
        if (event.matchmakingRun) {
            return NextResponse.json({ message: "Matchmaking has already been executed for this event." }, { status: 400 });
        }

        // Extract constraints setup during event creation
        const requiredSkills: string[] = event.skills || [];
        const maxTeamSize: number = event.spots || 0;
        
        // Copy the applicants pool into a mutable array
        const remainingApplicants = event.volunteers.map((v: any) => ({
            id: v._id.toString(),
            skills: v.skills || []
        }));

        const currentTeamIds: string[] = [];
        const unfilledSkills = new Set(requiredSkills);

        // --- The Greed Set Cover Algorithm ---
        // Loops until the structural team capacity is maximized OR the applicant pool dries up
        while (currentTeamIds.length < maxTeamSize && remainingApplicants.length > 0) {
            
            let bestApplicantIndex = 0;
            let maxCoverageScore = -1;

            // Evaluate every single applicant's coverage capability
            for (let i = 0; i < remainingApplicants.length; i++) {
                const applicant = remainingApplicants[i];
                
                // Calculate Coverage Score: mathematical intersection of applicant's skills with currently missing skills
                let coverageScore = 0;
                for (const skill of applicant.skills) {
                    if (unfilledSkills.has(skill)) {
                        coverageScore++;
                    }
                }

                // If they cover more missing skills than the current leader, draft them.
                // In the event of a tie (Coverage = maxCoverage), this automatically defers to FCFS 
                // because the > operator ignores ties, preserving the earliest array index!
                if (coverageScore > maxCoverageScore) {
                    maxCoverageScore = coverageScore;
                    bestApplicantIndex = i;
                }
            }
            
            // Draft the selected applicant into the Final Team
            const selectedApplicant = remainingApplicants[bestApplicantIndex];
            currentTeamIds.push(selectedApplicant.id);
            
            // Remove the newly satisfied skills from the requirement engine
            for (const skill of selectedApplicant.skills) {
                unfilledSkills.delete(skill);
            }

            // Exclude the drafted applicant from future evaluation iterations
            remainingApplicants.splice(bestApplicantIndex, 1);
        }

        // Permanently bind the algorithmic team to the Event roster
        event.draftedTeam = currentTeamIds;
        event.matchmakingRun = true;
        await event.save();

        return NextResponse.json({ 
            message: "Success! Intelligent Team Formed.", 
            teamSize: currentTeamIds.length,
            skillsSatisfied: requiredSkills.length - unfilledSkills.size,
            targetSize: maxTeamSize
        }, { status: 200 });

    } catch (error) {
        console.error("Matchmaking Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

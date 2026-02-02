import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectToDatabase();

        const topVolunteers = await User.find({ role: "volunteer" })
            .select("name email points avatar") // Select only necessary fields
            .sort({ points: -1 })
            .limit(50);

        return NextResponse.json(topVolunteers);

    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

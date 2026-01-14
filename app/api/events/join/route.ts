import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/lib/mongodb";
import Event from "@/models/Event";
import User from "@/models/User";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
    try {
        // 1. Get the current user
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { eventId } = await req.json();

        await connectToDatabase();

        // 2. Find the user in DB to get their _id
        const user = await User.findOne({ email: session.user.email });
        if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

        // 3. Find the event
        const event = await Event.findById(eventId);
        if (!event) return NextResponse.json({ message: "Event not found" }, { status: 404 });

        // 4. Check checks (Is full? Already joined?)
        if (event.filled >= event.spots) {
            return NextResponse.json({ message: "Event is full!" }, { status: 400 });
        }

        if (event.volunteers.includes(user._id)) {
            return NextResponse.json({ message: "You have already joined this event!" }, { status: 400 });
        }

        // 5. Update the Event (Add user ID, increase count)
        event.volunteers.push(user._id);
        event.filled += 1;
        await event.save();

        return NextResponse.json({ message: "Successfully registered!" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: "Error joining event" }, { status: 500 });
    }
}
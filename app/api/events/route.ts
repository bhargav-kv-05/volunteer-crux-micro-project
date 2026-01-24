import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/mongodb";
import Event from "@/models/Event";

export async function GET() {
    try {
        await connectToDatabase();

        // 1. Try to find events
        let events = await Event.find().sort({ createdAt: -1 });

        // 2. If no events exist, create the default Indian ones (Seeding)
        if (events.length === 0) {
            events = await Event.create([
                {
                    title: "Hussain Sagar Lake Cleanup",
                    date: "Jan 20, 2026",
                    location: "Necklace Road, Hyderabad",
                    image: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&q=80&w=600",
                    skills: ["Environmental", "Teamwork"],
                    spots: 50,
                    filled: 12
                },
                {
                    title: "Tech Education for Kids",
                    date: "Jan 22, 2026",
                    location: "Indiranagar Govt School, Bengaluru",
                    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=600",
                    skills: ["Teaching", "Communication"],
                    spots: 10,
                    filled: 5
                },
                {
                    title: "Food Distribution Drive",
                    date: "Jan 25, 2026",
                    location: "Dadar Station, Mumbai",
                    image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=600",
                    skills: ["Community Service", "Logistics"],
                    spots: 100,
                    filled: 45
                }
            ]);
        }

        return NextResponse.json(events);
    } catch (error) {
        return NextResponse.json({ message: "Error fetching events" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { title, date, location, skills, spots, image } = body;

        await connectToDatabase();

        const newEvent = await Event.create({
            title,
            date,
            location,
            skills,
            spots: parseInt(spots),
            image: image || "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80&w=600", // Default Volunteer Image
            organizer: session.user.id,
            filled: 0
        });

        return NextResponse.json({ message: "Event created successfully", event: newEvent }, { status: 201 });

    } catch (error) {
        console.error("Error creating event:", error);
        return NextResponse.json({ message: "Error creating event" }, { status: 500 });
    }
}
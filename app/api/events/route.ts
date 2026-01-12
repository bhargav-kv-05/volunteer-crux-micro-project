import { NextResponse } from "next/server";
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
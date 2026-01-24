import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Event from "@/models/Event";

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();

        const params = await props.params;
        const { id } = params;
        const event = await Event.findById(id);

        if (!event) {
            return NextResponse.json({ message: "Event not found" }, { status: 404 });
        }

        return NextResponse.json(event);
    } catch (error) {
        return NextResponse.json({ message: "Error fetching event" }, { status: 500 });
    }
}

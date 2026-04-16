import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Event from "@/models/Event";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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

export async function DELETE(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();
        const params = await props.params;
        const { id } = params;

        const event = await Event.findById(id);
        if (!event) return NextResponse.json({ message: "Event not found" }, { status: 404 });

        // SUPER ADMIN ENGINE: Delete allowed if strictly the explicit Organizer OR absolute Admin
        if (event.organizer !== session.user.id && session.user.role !== "admin") {
             return NextResponse.json({ message: "Forbidden: Super Admin or Organizer privileges strictly required." }, { status: 403 });
        }

        await Event.findByIdAndDelete(id);

        return NextResponse.json({ success: true, message: "Event completely obliterated" });
    } catch (error) {
        console.error("Error deleting event:", error);
        return NextResponse.json({ message: "Error wiping event" }, { status: 500 });
    }
}

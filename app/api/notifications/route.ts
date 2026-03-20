import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/mongodb";
import Notification from "@/models/Notification";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();
        
        // Fetch user's latest 20 notifications
        const notifications = await Notification.find({ userId: session.user.id })
            .sort({ createdAt: -1 })
            .limit(20);

        return NextResponse.json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { notificationId } = await req.json();

        await connectToDatabase();

        // "ALL" allows the user to mark the whole dropdown as read with one click
        if (notificationId === "ALL") {
            await Notification.updateMany(
                { userId: session.user.id, isRead: false },
                { $set: { isRead: true } }
            );
            return NextResponse.json({ success: true, message: "All notifications marked as read." });
        }

        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, userId: session.user.id },
            { $set: { isRead: true } },
            { new: true }
        );

        if (!notification) {
            return NextResponse.json({ message: "Notification not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, notification });
    } catch (error) {
        console.error("Error updating notification:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

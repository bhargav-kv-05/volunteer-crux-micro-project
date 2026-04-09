import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/mongodb";
import Event from "@/models/Event";
import Notification from "@/models/Notification";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { eventId, squadId, message, channel } = await req.json();
        
        if (!eventId || !message) {
            return NextResponse.json({ message: "Missing fields" }, { status: 400 });
        }

        await connectToDatabase();

        // 1. Target the event
        const event = await Event.findById(eventId);
        if (!event) {
            return NextResponse.json({ message: "Event not found" }, { status: 404 });
        }

        // 2. Identify all people involved using a Set so nobody gets duplicates
        const recipients = new Set<string>();
        
        if (channel === "squad" && squadId) {
            // STRICT ISOLATION: Only notify members natively in that precise sub-team! Organizer literally does not exist here.
            const squad = event.squads?.find((s: any) => s._id.toString() === squadId);
            if (squad) {
                squad.members.forEach((m: any) => recipients.add(m.toString()));
            }
        } else if (channel === "team") {
            // STRATEGIC LAYER: Notify the mathematically drafted team explicitly and the Organizer supervisor.
            if (event.draftedTeam && event.draftedTeam.length > 0) {
                event.draftedTeam.forEach((v: any) => recipients.add(v.toString()));
            } else {
                event.volunteers.forEach((v: any) => recipients.add(v.toString()));
            }
            if (event.organizer) recipients.add(event.organizer.toString());
        } else {
            // GLOBAL BROADCAST: Announcements or 'group' lobby
            event.volunteers.forEach((v: any) => recipients.add(v.toString()));
            if (event.organizer) {
                recipients.add(event.organizer.toString());
            }
        }

        // VERY IMPORTANT: Prevent the sender from getting a notification for a message they literally just typed
        recipients.delete(session.user.id);

        if (recipients.size === 0) {
            return NextResponse.json({ message: "Nobody else is in the event yet", success: true });
        }

        // 3. Format the text dynamically
        const isAnnouncement = channel === "announcements";
        const title = isAnnouncement 
            ? `New Announcement in ${event.title}`
            : `New Message in ${event.title} Chat`;

        // 4. Create the batch insertion payload
        const notificationsToInsert = Array.from(recipients).map(userId => ({
            userId,
            title,
            // Truncate the message preview to 60 chars so the UI dropdown doesn't look messy
            message: message.length > 60 ? message.substring(0, 60) + "..." : message,
            link: `/dashboard/events/${eventId}?channel=${channel || "group"}`,
            isRead: false
        }));

        await Notification.insertMany(notificationsToInsert);

        return NextResponse.json({ success: true, count: notificationsToInsert.length }, { status: 201 });
    } catch (error) {
        console.error("Error creating chat notifications:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

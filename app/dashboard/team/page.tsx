import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/mongodb";
import Event from "@/models/Event";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Calendar, MapPin, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import User from "@/models/User"; // Ensure User model is registered

async function getMyTeamEvents() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return null;

    await connectToDatabase();

    // Ensure User model is loaded before populating
    // This is a common Mongoose fix in Next.js dev mode
    if (!User) require("@/models/User");

    // Find events where the volunteers array contains the current user's ID
    const events = await Event.find({ volunteers: session.user.id })
        .populate("volunteers", "name email") // Get details of teammates
        .populate("organizer", "email") // Get organizer email
        .sort({ date: 1 });

    return events;
}

export default async function TeamPage() {
    const events = await getMyTeamEvents();

    if (!events) {
        return <div className="p-8">Please log in to view your team.</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Team & Projects</h1>
                <p className="text-muted-foreground mt-2">
                    Connect with your fellow volunteers in the events you've joined.
                </p>
            </div>

            {events.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-gray-50/50">
                    <Users className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium">No events joined yet</h3>
                    <p className="text-muted-foreground text-center max-w-sm mt-1 mb-4">
                        You haven't signed up for any volunteering events yet. Head to the dashboard to find opportunities!
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {events.map((event: any) => (
                        <Card key={event._id} className="flex flex-col">
                            <div className="h-32 w-full overflow-hidden relative bg-gray-100">
                                <img
                                    src={event.image}
                                    alt={event.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-3 left-4 text-white">
                                    <h3 className="font-bold text-lg leading-none">{event.title}</h3>
                                </div>
                            </div>

                            <CardContent className="p-4 space-y-3 flex-grow">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar className="w-4 h-4" />
                                    <span>{event.date}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <MapPin className="w-4 h-4" />
                                    <span>{event.location}</span>
                                </div>

                                <div className="pt-4">
                                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        Team Roster ({event.volunteers.length})
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {event.volunteers.map((vol: any) => (
                                            <div key={vol._id} className="flex items-center gap-2 bg-gray-100 pr-3 rounded-full border border-gray-200">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${vol.email}`} />
                                                    <AvatarFallback>{vol.name?.[0] || "V"}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-xs font-medium max-w-[80px] truncate">
                                                    {vol.name.split(" ")[0]}
                                                    {/* Show "You" if it's the current user? Logic skipped for simplicity */}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="p-4 bg-gray-50 border-t flex justify-between items-center text-xs text-muted-foreground">
                                <span>Have questions?</span>
                                {event.organizer?.email ? (
                                    <a
                                        href={`mailto:${event.organizer.email}?subject=Question regarding ${event.title}`}
                                        className="text-primary hover:underline font-medium flex items-center gap-1"
                                    >
                                        Email Organizer ✉️
                                    </a>
                                ) : (
                                    <span className="text-gray-400">Contact currently unavailable</span>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

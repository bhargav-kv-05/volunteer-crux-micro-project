"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Users, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import EventChat from "@/components/dashboard/event-chat";

interface Event {
    _id: string;
    title: string;
    date: string;
    location: string;
    image: string;
    skills: string[];
    spots: number;
    filled: number;
    volunteers: string[];
    draftedTeam?: string[];
    squads?: { _id: string, name: string, members: string[] }[];
    matchmakingRun?: boolean;
    organizer: string;
    description?: string; // Future proofing
}

export default function EventDetailsPage() {
    const { id } = useParams();
    const { data: session } = useSession();
    const router = useRouter();

    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);

    useEffect(() => {
        async function fetchEvent() {
            try {
                const res = await fetch(`/api/events/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setEvent(data);
                } else {
                    router.push("/dashboard/events"); // Redirect if not found
                }
            } catch (error) {
                console.error("Error fetching event", error);
            } finally {
                setLoading(false);
            }
        }
        if (id) fetchEvent();
    }, [id, router]);

    const handleJoin = async () => {
        if (!confirm("Confirm registration?")) return;
        setJoining(true);
        try {
            const res = await fetch("/api/events/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ eventId: id }),
            });
            if (res.ok) {
                alert("Successfully joined!");
                window.location.reload(); // Simple refresh to update state
            } else {
                const data = await res.json();
                alert("Error: " + data.message);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setJoining(false);
        }
    };

    if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-green-600" /></div>;
    if (!event) return null;

    const isOrganizer = session?.user?.id === event.organizer || session?.user?.role === "admin";
    const isJoined = event.volunteers.includes(session?.user?.id || "");
    const isDrafted = event.draftedTeam?.includes(session?.user?.id || "");
    const mySquad = event.squads?.find(s => s.members.includes(session?.user?.id || ""));
    
    // Core Engine Control: ALL applicants can access the Group Chat. Only Drafted members unlock the specific Team Chat Tab.
    const canViewChat = isJoined || isOrganizer;
    
    // Automatically close Registration if Matchmaking Engine has fired
    const isFull = event.matchmakingRun || event.filled >= event.spots;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-10">
            {/* Back Button */}
            <Link href="/dashboard/events">
                <Button variant="ghost" size="sm" className="mb-2 text-muted-foreground">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
                </Button>
            </Link>

            {/* Hero Image */}
            <div className="relative h-64 md:h-80 w-full rounded-xl overflow-hidden shadow-md">
                <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.title}</h1>
                    <div className="flex flex-wrap gap-4 text-sm md:text-base font-medium opacity-90">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" /> {event.date}
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" /> {event.location}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <h2 className="text-xl font-bold">About this Opportunity</h2>
                            <p className="text-gray-600 leading-relaxed">
                                {event.description || "Join us for this impactful event. Volunteers will work together to support the local community and environment. No prior experience is required, just a willingness to help!"}
                            </p>

                            <h3 className="font-semibold text-lg mt-4">Required Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {event.skills.map(skill => (
                                    <Badge key={skill} variant="secondary" className="px-3 py-1">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Team Section (Preview) */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Users className="h-5 w-5 text-gray-500" />
                                {event.matchmakingRun ? `${event.draftedTeam?.length || 0} Drafted Teammates` : `${event.volunteers.length} Applicants`}
                            </h3>
                            <Badge variant={isFull ? "destructive" : "outline"} className="bg-white">
                                {event.matchmakingRun ? "Matchmaking Complete" : `${event.spots - event.filled} Spots Target`}
                            </Badge>
                        </div>
                        <div className="flex -space-x-3 overflow-hidden">
                            {/* Mock Avatars for visuals since we don't have populates here yet */}
                            {[...Array(Math.min(event.filled, 5))].map((_, i) => (
                                <Avatar key={i} className="border-2 border-white w-10 h-10">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${event._id}${i}`} />
                                    <AvatarFallback>V</AvatarFallback>
                                </Avatar>
                            ))}
                            {event.filled > 5 && (
                                <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-white bg-gray-200 text-xs font-medium text-gray-600">
                                    +{event.filled - 5}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chat Section - Only visible if joined or if organizer */}
                    {canViewChat && (
                        <div className="mt-8">
                            <h3 className="text-xl font-bold mb-4">Team Communication</h3>
                            <EventChat
                                eventId={event._id}
                                eventTitle={event.title}
                                organizerId={event.organizer}
                                isDrafted={isDrafted || false}
                                squadId={mySquad?._id}
                                squadName={mySquad?.name}
                            />
                        </div>
                    )}
                </div>

                {/* Sidebar Actions */}
                <div className="space-y-6">
                    <Card className="border-2 border-green-50 shadow-lg">
                        <CardContent className="p-6 space-y-6">
                            <div className="text-center space-y-1">
                                <p className="text-sm text-gray-500">Status</p>
                                <div className="text-xl font-bold text-green-700">
                                    {isOrganizer ? "You are the Organizer" : isFull ? "Applications Closed" : "Open for Volunteers"}
                                </div>
                            </div>

                            <Button
                                className={`w-full h-12 text-lg ${isJoined ? "bg-green-100 text-green-800 hover:bg-green-200" : isOrganizer ? "bg-blue-100 text-blue-800 hover:bg-blue-200" : "bg-green-600 hover:bg-green-700"}`}
                                onClick={handleJoin}
                                disabled={isJoined || isFull || joining || isOrganizer || event.matchmakingRun}
                            >
                                {joining ? <Loader2 className="animate-spin" /> : isOrganizer ? (
                                    <span className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5" /> Managing Event</span>
                                ) : event.matchmakingRun ? (
                                    isDrafted ? <span className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5" /> Select Team</span> : "Not Selected"
                                ) : isJoined ? (
                                    <span className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5" /> Entered Pool</span>
                                ) : isFull ? "Selection Closed" : "Enter Applicant Pool"}
                            </Button>

                            <div className="text-center text-xs text-gray-400">
                                {isOrganizer ? "Manage your event from the Management tab." : "By registering, you commit to attending the event on the scheduled date."}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

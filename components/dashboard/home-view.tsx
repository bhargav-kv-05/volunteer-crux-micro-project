"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, ArrowRight, Star, Users } from "lucide-react";
import Link from "next/link";

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
}

export function DashboardHome() {
    const { data: session } = useSession();
    const [stats, setStats] = useState({ joined: 0, totalHours: 0, points: 0 });
    const [recommendations, setRecommendations] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState("Volunteer");

    useEffect(() => {
        if (session?.user?.name) {
            setUserName(session.user.name.split(" ")[0]); // First name
        }
    }, [session]);

    useEffect(() => {
        async function loadDashboardData() {
            try {
                // 1. Fetch User Profile for Skills
                const profileRes = await fetch("/api/user/profile");
                const profileData = await profileRes.json();
                const userSkills = profileData.skills || [];

                // 2. Fetch All Events
                const eventsRes = await fetch("/api/events");
                const allEvents: Event[] = await eventsRes.json();

                // 3. Calculate Stats (Joined Events)
                const myEvents = allEvents.filter(e =>
                    e.volunteers.includes(session?.user?.id || "")
                );

                // 4. Calculate Recommendations (Best Match & Not Joined)
                const availableEvents = allEvents.filter(e =>
                    !e.volunteers.includes(session?.user?.id || "") && e.filled < e.spots
                );

                availableEvents.sort((a, b) => {
                    const matchA = calculateMatch(a.skills, userSkills);
                    const matchB = calculateMatch(b.skills, userSkills);
                    return matchB - matchA; // Highest match first
                });

                setStats({
                    joined: myEvents.length,
                    totalHours: myEvents.length * 5,
                    points: profileData.points || 0
                });
                setRecommendations(availableEvents.slice(0, 3)); // Top 3

            } catch (error) {
                console.error("Dashboard load failed", error);
            } finally {
                setLoading(false);
            }
        }

        if (session?.user) {
            loadDashboardData();
        }
    }, [session]);

    function calculateMatch(eventSkills: string[], userSkills: string[]) {
        if (!eventSkills || !userSkills) return 0;
        const intersection = eventSkills.filter(s => userSkills.includes(s));
        return Math.round((intersection.length / eventSkills.length) * 100);
    }

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Welcome back, {userName}! 👋</h1>
                    <p className="text-gray-500 mt-1">Here is what's happening with your volunteer journey.</p>
                </div>
                <Link href="/dashboard/events">
                    <Button className="bg-green-600 hover:bg-green-700">
                        Find New Opportunities <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </section>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Events Joined</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.joined}</div>
                        <p className="text-xs text-muted-foreground">Active participations</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Impact Score</CardTitle>
                        <Star className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.points}</div>
                        <p className="text-xs text-muted-foreground">Points earned contributing</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recommendations */}
            <section>
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Recommended for You</h2>
                {recommendations.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-3">
                        {recommendations.map(event => (
                            <Card key={event._id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="h-40 overflow-hidden relative">
                                    <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                                    <Badge className="absolute top-2 right-2 bg-green-600">
                                        Top Match
                                    </Badge>
                                </div>
                                <CardHeader className="p-4 pb-2">
                                    <CardTitle className="text-base truncate">{event.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 space-y-2 text-sm text-gray-500 flex-grow">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-3 h-3" /> {event.date}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-3 h-3" /> {event.location}
                                    </div>
                                </CardContent>
                                <div className="p-4 pt-0 mt-auto">
                                    <Link href={`/dashboard/events/${event._id}`}>
                                        <Button variant="outline" className="w-full text-xs h-8">View Details</Button>
                                    </Link>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed">
                        <p className="text-gray-500">No new recommendations right now.</p>
                        <Link href="/dashboard/profile" className="text-green-600 text-sm hover:underline">Update your skills to get better matches</Link>
                    </div>
                )}
            </section>
        </div>
    );
}

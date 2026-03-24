"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Volunteer {
    _id: string;
    name: string;
    email: string;
    image?: string;
}

interface RosterData {
    event: {
        _id: string;
        title: string;
        date: string;
        attendees: string[]; // List of IDs who actually attended
        draftedTeam?: string[]; // The algorithmic selected roster
        matchmakingRun?: boolean;
        spots?: number;
        skills?: string[];
    };
    volunteers: Volunteer[];
}

export default function AttendanceManagerPage() {
    const { id } = useParams();
    const router = useRouter();
    const [data, setData] = useState<RosterData | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [runningMatchmaker, setRunningMatchmaker] = useState(false);

    useEffect(() => {
        async function fetchRoster() {
            try {
                const res = await fetch(`/api/events/${id}/roster`);
                if (res.ok) {
                    const jsonData = await res.json();
                    setData(jsonData);
                } else {
                    alert("Failed to load roster. Access denied.");
                    router.push("/dashboard/management");
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        if (id) fetchRoster();
    }, [id, router]);

    const toggleAttendance = async (volunteerId: string, currentStatus: boolean) => {
        setUpdating(volunteerId);
        try {
            const res = await fetch("/api/events/attendance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    eventId: id,
                    volunteerId: volunteerId,
                    attended: !currentStatus // Toggle
                }),
            });

            if (res.ok) {
                const { attendees } = await res.json();
                setData(prev => prev ? {
                    ...prev,
                    event: { ...prev.event, attendees }
                } : null);
            }
        } catch (error) {
            console.error("Update failed", error);
        } finally {
            setUpdating(null);
        }
    };

    const runMatchmaker = async () => {
        if (!confirm("Are you sure? This will finalize the perfect team and permanently lock out all other applicants from joining.")) return;
        setRunningMatchmaker(true);
        try {
            const res = await fetch(`/api/events/${id}/matchmake`, {
                method: "POST"
            });
            if (res.ok) {
                const result = await res.json();
                alert(`${result.message}\nFormed Team Size: ${result.teamSize} / ${result.targetSize}\nRequired Skills Completely Met: ${result.skillsSatisfied}`);
                window.location.reload();
            } else {
                const error = await res.json();
                alert(error.message);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setRunningMatchmaker(false);
        }
    };

    if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin" /></div>;
    if (!data) return null;

    return (
        <div className="container mx-auto max-w-4xl py-8 space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/management">
                    <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">{data.event.title} - Attendance</h1>
                    <p className="text-muted-foreground">Verify volunteers who participated.</p>
                </div>
            </div>

            {!data.event.matchmakingRun && (
                <Card className="border-blue-200 bg-blue-50/50 mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-800">
                            🧠 Intelligent Team Formation
                        </CardTitle>
                        <CardDescription className="text-blue-700">
                            Your target maximum capacity is {data.event.spots} members. There are currently {data.volunteers.length} applicants in the pool.
                            Execute the Matchmaking Algorithm to automatically select the optimal team based on complementary skill mathematics:
                            <div className="flex gap-2 mt-2">
                                {(data.event.skills || []).map(s => <Badge key={s} variant="secondary" className="bg-white/60">{s}</Badge>)}
                            </div>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button 
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                            disabled={runningMatchmaker || data.volunteers.length === 0}
                            onClick={runMatchmaker}
                        >
                            {runningMatchmaker ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Execute Matchmaking Algorithm"}
                        </Button>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>
                        {data.event.matchmakingRun ? `Finalized Algorithmic Team Roster` : `Applicant Pool (${data.volunteers.length})`}
                    </CardTitle>
                    <CardDescription>
                        {data.event.matchmakingRun 
                            ? "Mark drafted volunteers as verified once they physically complete the event to deploy their Certificate." 
                            : "This is the current pool of applicants. Awaiting Matchmaking Execution."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {data.volunteers.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">No volunteers have entered the applicant pool yet.</div>
                    ) : (
                        <div className="space-y-4">
                            {data.volunteers.map(vol => {
                                const isVerified = data.event.attendees.includes(vol._id);
                                const isDrafted = data.event.draftedTeam?.includes(vol._id);

                                // If matchmaking ran, completely hide users who weren't algorithmically drafted
                                if (data.event.matchmakingRun && !isDrafted) return null;
                                return (
                                    <div key={vol._id} className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <Avatar>
                                                <AvatarImage src={vol.image} />
                                                <AvatarFallback>{vol.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{vol.name}</p>
                                                <p className="text-sm text-gray-500">{vol.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            {data.event.matchmakingRun ? (
                                                <>
                                                    {isVerified ? (
                                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                                                            <CheckCircle2 className="w-3 h-3 mr-1" /> Certificate Released
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-gray-500">
                                                            Unverified
                                                        </Badge>
                                                    )}

                                                    <Button
                                                        size="sm"
                                                        variant={isVerified ? "outline" : "default"}
                                                        className={isVerified ? "text-red-500 hover:text-red-600 hover:bg-red-50" : "bg-green-600 hover:bg-green-700"}
                                                        disabled={updating === vol._id}
                                                        onClick={() => toggleAttendance(vol._id, isVerified)}
                                                    >
                                                        {updating === vol._id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : isVerified ? (
                                                            "Cancel Release"
                                                        ) : (
                                                            "Verify Attendance"
                                                        )}
                                                    </Button>
                                                </>
                                            ) : (
                                                <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 font-medium">
                                                    Awaiting Matchmaking Algorithm
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

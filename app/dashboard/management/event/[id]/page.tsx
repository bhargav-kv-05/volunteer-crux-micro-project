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
        attendees: string[]; // List of IDs who attended
    };
    volunteers: Volunteer[];
}

export default function AttendanceManagerPage() {
    const { id } = useParams();
    const router = useRouter();
    const [data, setData] = useState<RosterData | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

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

            <Card>
                <CardHeader>
                    <CardTitle>Registered Volunteers ({data.volunteers.length})</CardTitle>
                    <CardDescription>
                        Mark volunteers as "Verified" to issue their certificates.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {data.volunteers.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">No volunteers have registered yet.</div>
                    ) : (
                        <div className="space-y-4">
                            {data.volunteers.map(vol => {
                                const isVerified = data.event.attendees.includes(vol._id);
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
                                            {isVerified ? (
                                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                                                    <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-gray-500">
                                                    Pending
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
                                                    "Revoke"
                                                ) : (
                                                    "Mark Present"
                                                )}
                                            </Button>
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

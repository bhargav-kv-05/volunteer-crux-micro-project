"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const AVAILABLE_SKILLS = [
    "Environmental", "Teaching", "Community Service", "Medical",
    "Logistics", "Communication", "Tech", "Teamwork",
    "Leadership", "Event Planning"
];

export default function ManagementPage() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);

    // --- Access Control Check ---
    if (!session || session.user.role !== "ngo") {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center p-4">
                <div className="bg-red-100 p-4 rounded-full mb-4">
                    <ShieldAlert className="h-10 w-10 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Access Restricted</h2>
                <p className="text-gray-500 mt-2 max-w-md">
                    This page is reserved for verified NGO Partners.
                    If you are an NGO representative, please contact support to verify your account.
                </p>
            </div>
        );
    }
    const [formData, setFormData] = useState({
        title: "",
        date: "",
        location: "",
        spots: "50",
        image: ""
    });
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [myEvents, setMyEvents] = useState<any[]>([]);

    useEffect(() => {
        if (session?.user?.id) {
            fetchEvents();
        }
    }, [session]);

    const toggleSkill = (skill: string) => {
        setSelectedSkills(prev =>
            prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
        );
    };

    const fetchEvents = async () => {
        try {
            const res = await fetch("/api/events");
            if (res.ok) {
                const allEvents = await res.json();
                // Client-side filter for MVP. Ideally API supports ?organizer=ID
                const mine = allEvents.filter((e: any) => e.organizer === session?.user?.id);
                setMyEvents(mine);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    skills: selectedSkills
                })
            });

            if (res.ok) {
                alert("Event created successfully!");
                setFormData({ title: "", date: "", location: "", spots: "50", image: "" });
                setSelectedSkills([]);
                fetchEvents(); // Refresh list
            } else {
                alert("Failed to create event.");
            }
        } catch (error) {
            console.error(error);
            alert("Error creating event.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto max-w-2xl py-8 space-y-8">
            <h1 className="text-3xl font-bold">Event Management</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Create New Volunteering Event</CardTitle>
                    <CardDescription>Post a new opportunity for volunteers to join.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Form Fields ... (Kept same) */}
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Event Title</label>
                            <Input
                                required
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g., Lake Cleanup Drive"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Date</label>
                                <Input
                                    required
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    placeholder="e.g., Jan 25, 2026"
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Total Spots</label>
                                <Input
                                    required
                                    type="number"
                                    value={formData.spots}
                                    onChange={e => setFormData({ ...formData, spots: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Location</label>
                            <Input
                                required
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                placeholder="City or Venue"
                            />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Image URL (Optional)</label>
                            <Input
                                value={formData.image}
                                onChange={e => setFormData({ ...formData, image: e.target.value })}
                                placeholder="https://..."
                            />
                            <p className="text-xs text-muted-foreground">Leave empty for a random volunteer image.</p>
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Required Skills</label>
                            <div className="flex flex-wrap gap-2">
                                {AVAILABLE_SKILLS.map(skill => (
                                    <Badge
                                        key={skill}
                                        variant={selectedSkills.includes(skill) ? "default" : "outline"}
                                        className="cursor-pointer hover:opacity-80"
                                        onClick={() => toggleSkill(skill)}
                                    >
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <Button type="submit" className="w-full mt-4" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Event
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* My Created Events Section */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Your Events</h2>
                <div className="space-y-4">
                    {myEvents.length === 0 ? (
                        <p className="text-gray-500 text-sm">You haven't created any events yet.</p>
                    ) : (
                        myEvents.map(event => (
                            <Card key={event._id} className="overflow-hidden">
                                <div className="flex items-center p-4 gap-4">
                                    <img src={event.image} className="w-16 h-16 rounded-md object-cover" />
                                    <div className="flex-1">
                                        <h3 className="font-semibold">{event.title}</h3>
                                        <p className="text-sm text-gray-500">{event.date} • {event.location}</p>
                                    </div>
                                    <Button asChild variant="outline">
                                        <a href={`/dashboard/management/event/${event._id}`}>
                                            Manage Attendance
                                        </a>
                                    </Button>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Award, Calendar, Download } from "lucide-react";
import { CertificateCard } from "@/components/certificate-card";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function CertificatesPage() {
    const { data: session } = useSession();
    const [certificates, setCertificates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session?.user?.id) {
            fetchCertificates();
        }
    }, [session]);

    const fetchCertificates = async () => {
        try {
            const res = await fetch("/api/events");
            if (res.ok) {
                const allEvents = await res.json();
                // Filter events where user is in 'attendees' list
                const earned = allEvents.filter((e: any) =>
                    e.attendees && e.attendees.includes(session?.user?.id)
                );
                setCertificates(earned);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-green-600" /></div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">My Certificates</h1>
                <p className="text-muted-foreground mt-2">
                    Official recognition for your contributions to the community.
                </p>
            </div>

            {certificates.length === 0 ? (
                <Card className="bg-gray-50 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                        <Award className="h-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No certificates yet</h3>
                        <p className="text-gray-500 max-w-sm mt-1">
                            Participate in events and get verified by the organizer to earn your first certificate!
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {certificates.map(event => (
                        <Card key={event._id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
                                    <Award className="h-5 w-5 text-green-600" />
                                </div>
                                <CardTitle className="text-lg">{event.title}</CardTitle>
                                <CardDescription className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" /> {event.date}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className="w-full bg-green-600 hover:bg-green-700">
                                            View Certificate
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-5xl w-full p-0 bg-transparent border-none shadow-none">
                                        <CertificateCard
                                            volunteerName={session?.user?.name || "Volunteer"}
                                            eventName={event.title}
                                            date={event.date}
                                            organizerName="Verified Organizer"
                                        />
                                    </DialogContent>
                                </Dialog>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

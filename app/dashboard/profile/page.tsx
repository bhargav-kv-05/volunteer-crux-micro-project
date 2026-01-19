"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Save } from "lucide-react";

const AVAILABLE_SKILLS = [
    "Environmental",
    "Teaching",
    "Community Service",
    "Medical",
    "Logistics",
    "Communication",
    "Tech",
    "Teamwork",
    "Leadership",
    "Event Planning"
];

export default function ProfilePage() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

    // Add initialSkills state to track dirty state
    const [initialSkills, setInitialSkills] = useState<string[]>([]);

    useEffect(() => {
        fetchProfile();
    }, []);

    async function fetchProfile() {
        try {
            const res = await fetch("/api/user/profile", { cache: "no-store" });
            if (res.ok) {
                const data = await res.json();
                setUser(data);
                if (data.skills) {
                    setSelectedSkills(data.skills);
                    setInitialSkills(data.skills); // Set initial source of truth
                }
            }
        } catch (error) {
            console.error("Failed to fetch profile", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        setSaving(true);
        try {
            const res = await fetch("/api/user/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ skills: selectedSkills }),
            });

            if (res.ok) {
                // Update initial state to match the new saved state
                setInitialSkills(selectedSkills);
                alert("Skills updated successfully!");
                // No need to fetchProfile again since we updated local state
            } else {
                alert("Failed to update profile.");
            }
        } catch (error) {
            console.error("Error updating profile", error);
            alert("Something went wrong.");
        } finally {
            setSaving(false);
        }
    }

    const toggleSkill = (skill: string) => {
        setSelectedSkills(prev =>
            prev.includes(skill)
                ? prev.filter(s => s !== skill)
                : [...prev, skill]
        );
    };

    // Check if skills have changed
    const isDirty = JSON.stringify(selectedSkills.sort()) !== JSON.stringify(initialSkills.sort());

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-2xl py-8">
            <h1 className="mb-8 text-3xl font-bold">My Profile</h1>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Your account details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Name</label>
                                <p className="text-lg font-medium">{user?.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Email</label>
                                <p className="text-lg font-medium">{user?.email}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Role</label>
                                <Badge variant="outline" className="capitalize mt-1">{user?.role}</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Skills & Expertise</CardTitle>
                        <CardDescription>
                            Select the skills you possess. We use this to match you with the perfect volunteering opportunities.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6 flex flex-wrap gap-2">
                            {AVAILABLE_SKILLS.map((skill) => {
                                const isSelected = selectedSkills.includes(skill);
                                return (
                                    <Badge
                                        key={skill}
                                        variant={isSelected ? "default" : "outline"}
                                        className={`cursor-pointer px-3 py-1.5 text-sm transition-all hover:scale-105 ${isSelected ? "bg-primary hover:bg-primary/90" : "hover:border-primary"
                                            }`}
                                        onClick={() => toggleSkill(skill)}
                                    >
                                        {skill}
                                    </Badge>
                                );
                            })}
                        </div>

                        {/* Only show save button if changes were made */}
                        {isDirty && (
                            <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2">
                                <Button onClick={handleSave} disabled={saving}>
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {saving ? "Saving..." : "Save Changes"}
                                    {!saving && <Save className="ml-2 h-4 w-4" />}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect, startTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Save, RefreshCw, Trophy } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AVAILABLE_SKILLS = [
    "Environmental", "Teaching", "Community Service", "Medical",
    "Logistics", "Communication", "Tech", "Teamwork",
    "Leadership", "Event Planning"
];

const AVATAR_SEEDS = ["Felix", "Aneka", "Zack", "Molly", "Garfield", "Simba", "Salem", "Nala"];

export default function ProfilePage() {
    const { data: session, update } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [selectedAvatar, setSelectedAvatar] = useState("");

    // Add initialSkills state to track dirty state
    const [initialSkills, setInitialSkills] = useState<string[]>([]);
    const [initialAvatar, setInitialAvatar] = useState("");
    const [initialName, setInitialName] = useState("");

    // Change Password State
    const [isPasswordOpen, setIsPasswordOpen] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [passwordLoading, setPasswordLoading] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    async function fetchProfile() {
        try {
            const res = await fetch("/api/user/profile", { cache: "no-store" });
            if (res.ok) {
                const data = await res.json();
                setUser(data);
                setInitialName(data.name); // Track initial name
                if (data.skills) {
                    setSelectedSkills(data.skills);
                    setInitialSkills(data.skills);
                }
                if (data.avatar) {
                    setSelectedAvatar(data.avatar);
                    setInitialAvatar(data.avatar);
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
                body: JSON.stringify({
                    name: user.name, // Send updated name
                    skills: selectedSkills,
                    avatar: selectedAvatar,
                }),
            });

            if (res.ok) {
                setInitialSkills(selectedSkills);
                setInitialAvatar(selectedAvatar);
                setInitialName(user.name);

                // Update NextAuth session client-side
                await update({
                    ...session,
                    user: {
                        ...session?.user,
                        name: user.name
                    }
                });

                alert("Profile updated successfully!");
                startTransition(() => {
                    router.refresh();
                });
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

    async function handleChangePassword() {
        if (user?.hasPassword && !passwordForm.currentPassword) {
            alert("Please enter your current password");
            return;
        }
        if (!passwordForm.newPassword) {
            alert("Please enter a new password");
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert("New passwords do not match");
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            alert("Password must be at least 6 characters");
            return;
        }

        setPasswordLoading(true);
        try {
            const res = await fetch("/api/user/change-password", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword
                }),
            });

            const data = await res.json();

            if (res.ok) {
                alert("Password updated successfully!");
                setIsPasswordOpen(false);
                setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
            } else {
                alert(data.message || "Failed to update password");
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        } finally {
            setPasswordLoading(false);
        }
    }

    const toggleSkill = (skill: string) => {
        setSelectedSkills(prev =>
            prev.includes(skill)
                ? prev.filter(s => s !== skill)
                : [...prev, skill]
        );
    };

    const isDirty = (
        JSON.stringify(selectedSkills.sort()) !== JSON.stringify(initialSkills.sort()) ||
        selectedAvatar !== initialAvatar ||
        user?.name !== initialName
    );

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

                {/* Identity Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Public Profile</CardTitle>
                        <CardDescription>How you appear to others on the platform.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                        <div className="flex flex-col items-center gap-3">
                            <Avatar className="h-24 w-24 border-2 border-primary/20">
                                <AvatarImage src={selectedAvatar} />
                                <AvatarFallback className="text-2xl">{user?.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="grid grid-cols-4 gap-2">
                                {AVATAR_SEEDS.map(seed => {
                                    const url = `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}`;
                                    return (
                                        <button
                                            key={seed}
                                            onClick={() => setSelectedAvatar(url)}
                                            className={`rounded-full p-0.5 border-2 transition-all hover:scale-110 ${selectedAvatar === url ? "border-primary" : "border-transparent"}`}
                                        >
                                            <Avatar className="h-8 w-8 cursor-pointer">
                                                <AvatarImage src={url} />
                                            </Avatar>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="space-y-4 flex-1 w-full text-center sm:text-left">
                            <div>
                                <h3 className="text-xl font-bold">{user?.name}</h3>
                                <p className="text-muted-foreground">{user?.email}</p>
                                <Badge variant="secondary" className="mt-2 capitalize">{user?.role}</Badge>
                            </div>

                            <div className="flex items-center justify-center sm:justify-start gap-4 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                                <Trophy className="h-8 w-8 text-yellow-500" />
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{user?.points || 0}</div>
                                    <div className="text-xs uppercase font-semibold text-yellow-700">Impact Points</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Account Settings Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Account Settings</CardTitle>
                        <CardDescription>Update your personal information and security.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Full Name</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={user?.name || ""}
                                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                                    className="flex-1 px-3 py-2 border rounded-md text-sm"
                                    placeholder="Your Name"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 pt-4 border-t">
                            <label className="text-sm font-medium">Security</label>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                                <div>
                                    <h4 className="font-medium text-sm">Password</h4>
                                    <p className="text-xs text-muted-foreground">{user?.hasPassword ? "Securely update your password." : "Set a secure password for your account."}</p>
                                </div>
                                <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">{user?.hasPassword ? "Change Password" : "Set Password"}</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>{user?.hasPassword ? "Change Password" : "Set Password"}</DialogTitle>
                                            <DialogDescription>
                                                {user?.hasPassword ? "Enter your current password and a new password below." : "Enter a secure password to use for future email logins."}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            {user?.hasPassword && (
                                                <div className="space-y-2">
                                                    <Label>Current Password</Label>
                                                    <Input
                                                        type="password"
                                                        value={passwordForm.currentPassword}
                                                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                                    />
                                                </div>
                                            )}
                                            <div className="space-y-2">
                                                <Label>New Password</Label>
                                                <Input
                                                    type="password"
                                                    value={passwordForm.newPassword}
                                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Confirm New Password</Label>
                                                <Input
                                                    type="password"
                                                    value={passwordForm.confirmPassword}
                                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsPasswordOpen(false)}>Cancel</Button>
                                            <Button onClick={handleChangePassword} disabled={passwordLoading}>
                                                {passwordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                {user?.hasPassword ? "Update Password" : "Set Password"}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Skills Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Skills & Expertise</CardTitle>
                        <CardDescription>
                            Select the skills you possess.
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

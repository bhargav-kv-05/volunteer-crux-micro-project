"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Crown } from "lucide-react";

export default function LeaderboardPage() {
    const { data: session } = useSession();
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/leaderboard")
            .then((res) => res.json())
            .then((data) => {
                setLeaderboard(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0:
                return <Crown className="h-6 w-6 text-yellow-500" />;
            case 1:
                return <Medal className="h-6 w-6 text-gray-400" />;
            case 2:
                return <Medal className="h-6 w-6 text-amber-600" />;
            default:
                return <span className="text-lg font-bold text-gray-500">#{index + 1}</span>;
        }
    };

    const getRankRowClass = (index: number) => {
        switch (index) {
            case 0: return "bg-yellow-50/50 border-yellow-200";
            case 1: return "bg-gray-50/50 border-gray-200";
            case 2: return "bg-orange-50/50 border-orange-200";
            default: return "border-transparent hover:bg-gray-50";
        }
    };

    return (
        <div className="container mx-auto max-w-3xl py-8 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tight">Volunteer Leaderboard</h1>
                <p className="text-muted-foreground">Top contributors making a difference.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-primary" />
                        Top Volunteers
                    </CardTitle>
                    <CardDescription>Ranked by verified event participation points.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y">
                        {leaderboard.map((user, index) => {
                            const isMe = session?.user?.email === user.email;
                            return (
                                <div
                                    key={user._id}
                                    className={`flex items-center p-4 transition-colors border-l-4 ${getRankRowClass(index)} ${isMe ? "bg-primary/5 border-l-primary" : ""}`}
                                >
                                    <div className="flex-none w-12 flex items-center justify-center mr-4">
                                        {getRankIcon(index)}
                                    </div>

                                    <Avatar className="h-10 w-10 border mr-4">
                                        <AvatarImage src={user.avatar} alt={user.name} />
                                        <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1">
                                        <div className="font-semibold flex items-center gap-2">
                                            {user.name}
                                            {isMe && <Badge variant="secondary" className="text-xs">You</Badge>}
                                        </div>
                                        <div className="text-xs text-muted-foreground">{user.email?.split('@')[0]}***</div>
                                    </div>

                                    <div className="flex-none text-right">
                                        <div className="font-bold text-lg text-primary">{user.points || 0}</div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Points</div>
                                    </div>
                                </div>
                            );
                        })}

                        {!loading && leaderboard.length === 0 && (
                            <div className="p-8 text-center text-muted-foreground">
                                No data yet. Start volunteering to earn points!
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

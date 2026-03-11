"use client";

import { useEffect, useState, useRef } from "react";
import { useSocket } from "@/components/providers/socket-provider";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, User as UserIcon, Megaphone, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Message {
    user: string;
    message: string;
    timestamp: string;
    avatar?: string;
    channel?: "general" | "announcements";
}

export default function EventChat({ eventId, eventTitle, organizerId }: { eventId: string, eventTitle: string, organizerId: string }) {
    const { socket, isConnected } = useSocket();
    const { data: session } = useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [activeChannel, setActiveChannel] = useState<"general" | "announcements">("general");
    const scrollRef = useRef<HTMLDivElement>(null);

    const isOrganizer = session?.user?.id === organizerId;

    useEffect(() => {
        if (!socket || !isConnected) return;

        // Join the event room
        socket.emit("join_room", eventId);

        // Listen for incoming messages
        const handleMessage = (data: Message) => {
            // Ensure legacy messages default to 'general'
            const msgWithChannel = { ...data, channel: data.channel || "general" };
            setMessages((prev) => [...prev, msgWithChannel]);
        };

        socket.on("receive_message", handleMessage);

        return () => {
            socket.off("receive_message", handleMessage);
        };
    }, [socket, isConnected, eventId]);

    // Auto-scroll to bottom
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, activeChannel]);

    const sendMessage = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || !socket || !session?.user) return;

        const messageData = {
            eventId,
            user: session.user.name || "Anonymous",
            avatar: session.user.image,
            message: input,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            channel: activeChannel,
        };

        // Emit message to server
        socket.emit("send_message", messageData);

        setInput("");
    };

    const filteredMessages = messages.filter(m => (m.channel || "general") === activeChannel);

    return (
        <Card className="h-[600px] flex flex-col shadow-md">
            <CardHeader className="bg-primary/5 border-b p-4">
                <CardTitle className="text-lg flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
                            <span className={`relative inline-flex rounded-full h-3 w-3 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        </span>
                        {eventTitle} Chat
                    </div>

                    {/* Channel Toggles */}
                    <div className="flex bg-gray-100 p-1 rounded-lg w-full">
                        <button
                            onClick={() => setActiveChannel("general")}
                            className={`flex flex-1 items-center justify-center gap-2 text-sm font-medium py-2 rounded-md transition-all ${activeChannel === "general" ? "bg-white shadow text-primary" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            <Users className="h-4 w-4" /> Team Chat
                        </button>
                        <button
                            onClick={() => setActiveChannel("announcements")}
                            className={`flex flex-1 items-center justify-center gap-2 text-sm font-medium py-2 rounded-md transition-all ${activeChannel === "announcements" ? "bg-white shadow text-primary" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            <Megaphone className="h-4 w-4" /> Announcements
                        </button>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {filteredMessages.length === 0 ? (
                    <div className="text-center text-gray-400 mt-20 flex flex-col items-center gap-2">
                        {activeChannel === "general" ? <Users className="h-8 w-8 opacity-50" /> : <Megaphone className="h-8 w-8 opacity-50" />}
                        <p>No messages in {activeChannel === "general" ? "Team Chat" : "Announcements"} yet.</p>
                        <p className="text-xs text-gray-500">
                            {activeChannel === "general" ? "Start the conversation with your team!" : isOrganizer ? "Post important updates here." : "Wait for updates from the organizer."}
                        </p>
                    </div>
                ) : (
                    filteredMessages.map((msg, idx) => {
                        const isMe = msg.user === session?.user?.name;
                        const isAnnouncement = msg.channel === "announcements";

                        return (
                            <div key={idx} className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={msg.avatar} />
                                    <AvatarFallback><UserIcon className="h-4 w-4" /></AvatarFallback>
                                </Avatar>
                                <div className={`flex flex-col max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
                                    <div className={`flex items-baseline gap-2 mb-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                                        <span className={`text-xs font-semibold ${isAnnouncement ? 'text-red-600' : 'text-gray-600'}`}>
                                            {msg.user} {isAnnouncement && "(Organizer)"}
                                        </span>
                                        <span className="text-[10px] text-gray-400">{msg.timestamp}</span>
                                    </div>
                                    <div className={`p-3 rounded-lg text-sm shadow-sm ${isMe
                                        ? "bg-primary text-primary-foreground rounded-tr-none"
                                        : isAnnouncement
                                            ? "bg-red-50 border border-red-100 text-red-900 rounded-tl-none"
                                            : "bg-white border rounded-tl-none"
                                        }`}>
                                        {msg.message}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={scrollRef} />
            </CardContent>
            <div className="p-4 border-t bg-white">
                {activeChannel === "announcements" && !isOrganizer ? (
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500 bg-gray-100 p-3 rounded-md border border-gray-200">
                        <Megaphone className="h-4 w-4" /> Only the Organizer can post announcements.
                    </div>
                ) : (
                    <form onSubmit={sendMessage} className="flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={isConnected ? `Message #${activeChannel}...` : "Connecting..."}
                            disabled={!isConnected}
                            className="flex-1"
                        />
                        <Button type="submit" size="icon" disabled={!isConnected || !input.trim()}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                )}
            </div>
        </Card>
    );
}

"use client";

import { useEffect, useState, useRef } from "react";
import { useSocket } from "@/components/providers/socket-provider";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, User as UserIcon, Megaphone, Users, Lock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Message {
    user: string;
    message: string;
    timestamp: string;
    avatar?: string;
    channel?: "group" | "team" | "announcements";
}

export default function EventChat({ eventId, eventTitle, organizerId, isDrafted = false }: { eventId: string, eventTitle: string, organizerId: string, isDrafted?: boolean }) {
    const { socket, isConnected } = useSocket();
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    const isOrganizer = session?.user?.id === organizerId;
    
    // Dynamically retrieve the specific channel the user clicked from their Notifications panel
    const queryChannel = searchParams?.get("channel") as "group" | "team" | "announcements" | null;
    
    // Security Pass: Instantly reject a user if they maliciously inject ?channel=team into the URL but aren't mathematically drafted
    const safeInitialChannel = queryChannel === "team" && !isDrafted && !isOrganizer 
        ? "group" 
        : (queryChannel || (isDrafted ? "team" : "group"));

    const [activeChannel, setActiveChannel] = useState<"group" | "team" | "announcements">(safeInitialChannel);

    // Deep sync: Ensure Next.js client-side navigation (clicking via dropdown without hard refresh) updates the UI automatically
    useEffect(() => {
        if (queryChannel === "announcements") {
            setActiveChannel("announcements");
        } else if (queryChannel === "team" && (isDrafted || isOrganizer)) {
            setActiveChannel("team");
        } else if (queryChannel === "group") {
            setActiveChannel("group");
        }
    }, [queryChannel, isDrafted, isOrganizer]);

    useEffect(() => {
        if (!socket || !isConnected) return;

        // Join the event room
        socket.emit("join_room", eventId);

        // Listen for incoming messages
        const handleMessage = (data: Message) => {
            // Ensure legacy messages default to 'group'
            const msgWithChannel = { ...data, channel: data.channel || "group" };
            setMessages((prev) => [...prev, msgWithChannel]);
        };

        // Load entire chat history upon connection
        const handleHistory = (history: Message[]) => {
            setMessages(history.map(msg => ({ ...msg, channel: (msg.channel as any) === "general" ? "group" : (msg.channel || "group") })));
        };

        socket.on("receive_message", handleMessage);
        socket.on("chat_history", handleHistory);

        return () => {
            socket.off("receive_message", handleMessage);
            socket.off("chat_history", handleHistory);
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

        // Emit message to server for live chat UI
        socket.emit("send_message", messageData);

        // Quietly trigger the persistent database notification for offline users
        fetch("/api/notifications/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ eventId, message: input, channel: activeChannel })
        }).catch(err => console.error("Failed to insert notification", err));

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
                    <div className="flex bg-gray-100 p-1 rounded-lg w-full overflow-x-auto scroolbar-hide">
                        <button
                            onClick={() => setActiveChannel("group")}
                            className={`flex flex-1 items-center justify-center gap-2 text-sm font-medium py-2 rounded-md transition-all whitespace-nowrap px-3 ${activeChannel === "group" ? "bg-white shadow text-primary" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            <Users className="h-4 w-4" /> Group Chat
                        </button>
                        
                        {(isDrafted || isOrganizer) && (
                            <button
                                onClick={() => setActiveChannel("team")}
                                className={`flex flex-1 items-center justify-center gap-2 text-sm font-medium py-2 rounded-md transition-all whitespace-nowrap px-3 ${activeChannel === "team" ? "bg-white shadow text-primary" : "text-gray-500 hover:text-gray-700"}`}
                            >
                                <Lock className="h-4 w-4" /> Team Chat
                            </button>
                        )}

                        <button
                            onClick={() => setActiveChannel("announcements")}
                            className={`flex flex-1 items-center justify-center gap-2 text-sm font-medium py-2 rounded-md transition-all whitespace-nowrap px-3 ${activeChannel === "announcements" ? "bg-white shadow text-primary" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            <Megaphone className="h-4 w-4" /> Announcements
                        </button>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {filteredMessages.length === 0 ? (
                    <div className="text-center text-gray-400 mt-20 flex flex-col items-center gap-2">
                        {activeChannel === "team" ? <Lock className="h-8 w-8 opacity-50" /> : activeChannel === "group" ? <Users className="h-8 w-8 opacity-50" /> : <Megaphone className="h-8 w-8 opacity-50" />}
                        <p>No messages in {activeChannel === "team" ? "Secured Team Chat" : activeChannel === "group" ? "General Group Chat" : "Announcements"} yet.</p>
                        <p className="text-xs text-gray-500 max-w-[250px] mx-auto">
                            {activeChannel === "team" ? "Strategize securely with your algorithmically selected squad!" : activeChannel === "group" ? "Chat and socialize with the entire applicant pool!" : isOrganizer ? "Post important updates here." : "Wait for official updates from the organizer here."}
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

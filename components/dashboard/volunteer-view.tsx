"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Calendar, MapPin, ArrowRight, Loader2, Search } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

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

export function VolunteerView() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Environmental", "Teaching", "Community Service"];

  async function fetchEvents() {
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      setEvents(data);
      setFilteredEvents(data);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  // Filter Logic
  useEffect(() => {
    let result = events;

    // 1. Filter by Search Text
    if (searchQuery) {
      result = result.filter(e =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 2. Filter by Category
    if (selectedCategory !== "All") {
      result = result.filter(e => e.skills.includes(selectedCategory));
    }

    setFilteredEvents(result);
  }, [searchQuery, selectedCategory, events]);

  async function handleJoin(eventId: string) {
    if (!confirm("Are you sure you want to volunteer for this event?")) return;

    setJoiningId(eventId);

    try {
      const res = await fetch("/api/events/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("🎉 Success! You have joined the team.");
        fetchEvents(); // Refresh list
      } else {
        alert("❌ " + data.message);
      }
    } catch (error) {
      alert("Something went wrong.");
    } finally {
      setJoiningId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <section className="space-y-6">

      {/* --- Filter Bar --- */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search events or locations..."
            className="pl-9 bg-gray-50 border-gray-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat)}
              className={selectedCategory === cat ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {filteredEvents.length} Opportunities Found
        </h2>
      </div>

      {/* --- Events Grid --- */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.map((event) => {
          // Robust comparison logic
          const userId = session?.user?.id || "";
          const isJoined = event.volunteers.some(id => String(id) === String(userId));
          const isFull = event.filled >= event.spots;

          return (
            <Card key={event._id} className="overflow-hidden border-gray-200 hover:shadow-md transition-all group flex flex-col">
              <div className="h-48 overflow-hidden relative">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge className={`absolute top-3 right-3 text-black hover:bg-white/90 ${isFull ? "bg-red-100 text-red-700" : "bg-white"}`}>
                  {event.filled}/{event.spots} filled
                </Badge>
              </div>

              <CardHeader className="p-5 pb-2">
                <div className="flex flex-wrap gap-2 mb-2">
                  {event.skills.map((skill) => (
                    <span key={skill} className="text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-50 px-2 py-1 rounded-sm">
                      {skill}
                    </span>
                  ))}
                </div>
                <h3 className="font-bold text-lg leading-tight">{event.title}</h3>
              </CardHeader>

              <CardContent className="p-5 py-2 space-y-2 text-sm text-gray-600 flex-grow">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {event.date}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {event.location}
                </div>
              </CardContent>

              <CardFooter className="p-5 pt-4">
                <Button
                  onClick={() => handleJoin(event._id)}
                  disabled={isJoined || isFull || joiningId === event._id}
                  className={`w-full text-white transition-colors ${isJoined
                    ? "bg-green-600 hover:bg-green-600 cursor-default"
                    : "bg-gray-900 hover:bg-green-700 group-hover:bg-green-600"
                    }`}
                >
                  {joiningId === event._id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isJoined ? (
                    "Registered ✅"
                  ) : isFull ? (
                    "Event Full 🚫"
                  ) : (
                    <>
                      Register Now
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Calendar, MapPin, ArrowRight, Loader2, Search } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [userSkills, setUserSkills] = useState<string[]>([]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");

  const categories = ["All", "Environmental", "Teaching", "Community Service"];
  const locations = ["All", "Hyderabad", "Bengaluru", "Mumbai"];

  async function fetchData() {
    try {
      // 1. Fetch Events
      const eventsRes = await fetch("/api/events");
      const eventsData = await eventsRes.json();

      // 2. Fetch User Skills (for matching algo)
      let skills: string[] = [];
      const profileRes = await fetch("/api/user/profile", { cache: "no-store" });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        skills = profileData.skills || [];
        setUserSkills(skills);
      }

      // 3. Attach Match Score to events (local calculation)
      // Note: In a production app with pagination, this might be done backend-side.
      setEvents(eventsData);
      setFilteredEvents(eventsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
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

    // 3. Filter by Location
    if (selectedLocation !== "All") {
      result = result.filter(e => e.location.includes(selectedLocation));
    }

    // 4. Intelligent Sorting: Show High Match first!
    result.sort((a, b) => {
      const aMatch = calculateMatch(a.skills, userSkills);
      const bMatch = calculateMatch(b.skills, userSkills);
      return bMatch - aMatch; // Descending
    });

    setFilteredEvents([...result]); // Spread to trigger re-render
  }, [searchQuery, selectedCategory, selectedLocation, events, userSkills]);

  function calculateMatch(eventSkills: string[], userSkills: string[]) {
    if (!eventSkills || eventSkills.length === 0) return 0;
    const intersection = eventSkills.filter(s => userSkills.includes(s));
    return Math.round((intersection.length / eventSkills.length) * 100);
  }

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
        fetchData(); // Refresh list to update spots
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
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat === "All" ? "All Categories" : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc === "All" ? "All Locations" : loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          const userId = session?.user?.id || "";
          const isJoined = event.volunteers.some(id => String(id) === String(userId));
          const isFull = event.filled >= event.spots;
          const matchScore = calculateMatch(event.skills, userSkills);
          const isHighMatch = matchScore >= 50; // Threshold for "High Match"

          return (
            <Card key={event._id} className={`overflow-hidden border-gray-200 hover:shadow-md transition-all group flex flex-col ${isHighMatch ? 'ring-2 ring-green-500/20' : ''}`}>
              <div className="h-48 overflow-hidden relative">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Status Badges */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                  <Badge className={`text-black hover:bg-white/90 ${isFull ? "bg-red-100 text-red-700" : "bg-white"}`}>
                    {event.filled}/{event.spots} filled
                  </Badge>
                  {isHighMatch && (
                    <Badge className="bg-green-600 hover:bg-green-700 text-white shadow-lg animate-pulse">
                      🔥 {matchScore}% Match
                    </Badge>
                  )}
                </div>
              </div>

              <CardHeader className="p-5 pb-2">
                <div className="flex flex-wrap gap-2 mb-2">
                  {event.skills.map((skill) => (
                    <span key={skill} className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm ${userSkills.includes(skill) ? "bg-green-100 text-green-700 border border-green-200" : "bg-gray-100 text-gray-600"}`}>
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
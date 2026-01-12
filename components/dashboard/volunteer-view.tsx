"use client";

import { useEffect, useState } from "react";
import { Calendar, MapPin, Users, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Event {
  _id: string;
  title: string;
  date: string;
  location: string;
  image: string;
  skills: string[];
  spots: number;
  filled: number;
}

export function VolunteerView() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch("/api/events");
        const data = await res.json();
        setEvents(data);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <span className="ml-2 text-gray-500">Finding opportunities near you...</span>
      </div>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Available Opportunities</h2>
        <span className="text-sm text-gray-500">Based on your location</span>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Card key={event._id} className="overflow-hidden border-gray-200 hover:shadow-md transition-all group">
            <div className="h-48 overflow-hidden relative">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <Badge className="absolute top-3 right-3 bg-white text-black hover:bg-white/90">
                {event.filled}/{event.spots} filled
              </Badge>
            </div>

            <CardHeader className="p-5 pb-2">
              <div className="flex gap-2 mb-2">
                {event.skills.map((skill) => (
                  <span key={skill} className="text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-50 px-2 py-1 rounded-sm">
                    {skill}
                  </span>
                ))}
              </div>
              <h3 className="font-bold text-lg leading-tight">{event.title}</h3>
            </CardHeader>

            <CardContent className="p-5 py-2 space-y-2 text-sm text-gray-600">
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
              <Button className="w-full bg-gray-900 hover:bg-green-700 text-white group-hover:bg-green-600 transition-colors">
                Register Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
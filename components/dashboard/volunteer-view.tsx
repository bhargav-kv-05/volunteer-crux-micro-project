import { Calendar, MapPin } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const events = [
  {
    id: 1,
    title: "Community Beach Cleanup",
    date: "Jan 15, 2026",
    location: "Santa Monica Beach",
    image: "/beach-cleanup-volunteers.png",
    skills: ["Teamwork", "Physical Activity"],
  },
  {
    id: 2,
    title: "Food Bank Distribution",
    date: "Jan 18, 2026",
    location: "Downtown Community Center",
    image: "/food-bank-volunteers.png",
    skills: ["Organization", "Customer Service"],
  },
  {
    id: 3,
    title: "Tree Planting Drive",
    date: "Jan 22, 2026",
    location: "City Park West",
    image: "/tree-planting-volunteers.png",
    skills: ["Environmental", "Teamwork"],
  },
]

export function VolunteerView() {
  return (
    <section>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">Available Opportunities</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Card key={event.id} className="overflow-hidden border-gray-200">
            <div className="aspect-video w-full overflow-hidden bg-gray-100">
              <img src={event.image || "/placeholder.svg"} alt={event.title} className="h-full w-full object-cover" />
            </div>
            <CardHeader className="pb-3">
              <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
            </CardHeader>
            <CardContent className="space-y-3 pb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                {event.date}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                {event.location}
              </div>
              <div>
                <p className="mb-2 text-xs font-medium text-gray-700">Skills Needed:</p>
                <div className="flex flex-wrap gap-2">
                  {event.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Register</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  )
}

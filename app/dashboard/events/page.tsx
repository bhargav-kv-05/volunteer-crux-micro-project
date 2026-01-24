import { VolunteerView } from "@/components/dashboard/volunteer-view";

export default function EventsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Find Opportunities</h1>
                <p className="text-muted-foreground mt-2">
                    Browse and filter volunteering events that match your skills.
                </p>
            </div>

            <VolunteerView />
        </div>
    )
}

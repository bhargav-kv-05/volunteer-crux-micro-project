import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { VolunteerView } from "@/components/dashboard/volunteer-view"
import { NgoView } from "@/components/dashboard/ngo-view"

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-white">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-8">
            <VolunteerView />
            {/* <NgoView />  <-- hidden for now! */}
          </div>
        </main>
      </div>
    </div>
  )
}

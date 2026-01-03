"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Calendar, Users, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Find Events", href: "/dashboard/events", icon: Calendar },
  { name: "My Team", href: "/dashboard/team", icon: Users },
  { name: "Management", href: "/dashboard/management", icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 border-r border-gray-200 bg-white lg:block">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b border-gray-200 px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-white">VC</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">Volunteer Crux</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive ? "bg-primary/10 text-primary" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

"use client"

import { Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function DashboardHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input type="search" placeholder="Search events, volunteers..." className="pl-10" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-gray-700" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
        </Button>
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder-user.jpg" alt="User" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}

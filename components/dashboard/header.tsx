"use client"

import { useEffect, useState } from "react"
import { Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"

export function DashboardHeader() {
  const { data: session } = useSession();
  const user = session?.user;

  const [notifications, setNotifications] = useState<any[]>([]);
  const [livePoints, setLivePoints] = useState(user?.points || 0);

  // Fetch dynamic data on mount
  useEffect(() => {
    if (user?.id) {
        // Fetch notifications
        fetch("/api/notifications")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setNotifications(data);
            })
            .catch(console.error);

        // Fetch live points to fix NextAuth static token desync
        fetch("/api/user/profile")
            .then(res => res.json())
            .then(data => {
                if (data && typeof data.points === 'number') setLivePoints(data.points);
            })
            .catch(console.error);
    }
  }, [user?.id]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (id: string) => {
      // Optimistically update local UI instantly
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      
      await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId: id })
      });
  };

  const markAllAsRead = async () => {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId: "ALL" })
      });
  };

  // Get initials for avatar fallback
  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input type="search" placeholder="Search events, volunteers..." className="pl-10" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        {livePoints > 0 && (
          <div className="hidden md:flex items-center text-sm font-medium text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200 mr-2">
            🏆 {livePoints} pts
          </div>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-gray-700" />
              {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                      {unreadCount}
                  </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 overflow-hidden p-0">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50/80 border-b">
                <span className="font-semibold text-sm">Notifications</span>
                {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-blue-600 hover:text-blue-800 font-medium" onClick={markAllAsRead}>
                        Mark all read
                    </Button>
                )}
            </div>
            <div className="max-h-[350px] overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="p-8 text-sm text-gray-400 text-center flex flex-col items-center gap-3">
                        <div className="p-3 bg-gray-50 rounded-full">
                            <Bell className="h-6 w-6 text-gray-300" />
                        </div>
                        <p>All caught up!</p>
                    </div>
                ) : (
                    notifications.map(n => (
                        <DropdownMenuItem key={n._id} className={`p-4 border-b border-gray-50 cursor-pointer flex flex-col items-start gap-1 rounded-none transition-colors ${!n.isRead ? 'bg-blue-50/40 hover:bg-blue-50/60' : 'hover:bg-gray-50'}`} onClick={() => markAsRead(n._id)} asChild>
                            <Link href={n.link} className="w-full">
                                <div className="flex items-start justify-between w-full mb-1">
                                    <span className={`text-sm ${!n.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'} line-clamp-1`}>{n.title}</span>
                                    {!n.isRead && <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-1.5 ml-3" />}
                                </div>
                                <span className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{n.message}</span>
                            </Link>
                        </DropdownMenuItem>
                    ))
                )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9 border">
                <AvatarImage src={user?.avatar || user?.image || ""} alt={user?.name || "User"} />
                <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || "user@example.com"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/dashboard/profile">
              <DropdownMenuItem className="cursor-pointer">
                Profile
              </DropdownMenuItem>
            </Link>

            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer" onClick={() => signOut({ callbackUrl: "/" })}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

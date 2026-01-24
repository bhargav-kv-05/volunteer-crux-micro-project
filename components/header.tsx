import Link from "next/link";
import { Sprout } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Sprout className="h-7 w-7 text-primary" />
          <span className="text-xl font-semibold text-foreground">Volunteer Crux</span>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#" className="text-sm font-medium text-foreground transition-colors hover:text-primary">
            Home
          </a>
          <a href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Explore
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-sm font-medium">
              Login
            </Button>
          </Link>
          <Link href="/join-ngo">
            <Button size="sm" className="text-sm font-medium">
              Join as NGO
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

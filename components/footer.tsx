import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Volunteer Crux. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4 sm:gap-6 justify-center">
            <Link href="/privacy" className="text-sm text-muted-foreground transition-colors hover:text-primary">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground transition-colors hover:text-primary">
              Terms of Service
            </Link>
            <Link href="/join-ngo" className="text-sm text-muted-foreground transition-colors hover:text-primary">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

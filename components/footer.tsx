export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Volunteer Crux. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-primary">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-primary">
              Terms of Service
            </a>
            <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-primary">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

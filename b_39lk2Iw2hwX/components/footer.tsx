import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/30 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">S</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">Studio AI</span>
          </div>

          <nav className="flex items-center gap-6">
            <Link href="/#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Pricing
            </Link>
            <Link href="/#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              How It Works
            </Link>
            <Link href="/auth/login" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Sign In
            </Link>
          </nav>

          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Studio AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

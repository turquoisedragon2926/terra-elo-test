import Link from 'next/link';

export function Header() {
  return (
    <header className="glass sticky top-0 z-50 w-full border-b border-border/50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary to-accent" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Terra AI Chess
          </span>
        </Link>

        <nav className="flex items-center space-x-6">
          <Link
            href="/"
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
          >
            Leaderboard
          </Link>
          <Link
            href="/matches"
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
          >
            Matches
          </Link>
          <Link
            href="/matches/new"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Add Match
          </Link>
        </nav>
      </div>
    </header>
  );
}

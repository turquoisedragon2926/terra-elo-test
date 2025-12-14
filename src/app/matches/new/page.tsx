import { Header } from '@/components/layout/header';
import { MatchForm } from '@/components/matches/match-form';
import Link from 'next/link';

export default function NewMatchPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            ← Back to Leaderboard
          </Link>
        </div>

        <MatchForm />
      </main>
    </div>
  );
}

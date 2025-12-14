'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { format } from 'date-fns';
import type { Match, Player } from '@/types';

type MatchWithPlayers = Match & {
  whitePlayer: Player;
  blackPlayer: Player;
};

export default function MatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMatches() {
      try {
        const response = await fetch('/api/matches?limit=50');
        const data = await response.json();
        setMatches(data);
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();
  }, []);

  const getResultText = (match: any) => {
    if (match.match.result === 'white_win') return `${match.whitePlayer.name} won`;
    if (match.match.result === 'black_win') return `${match.blackPlayer.name} won`;
    return 'Draw';
  };

  const getResultColor = (result: string) => {
    if (result === 'white_win') return 'text-green-500';
    if (result === 'black_win') return 'text-blue-500';
    return 'text-yellow-500';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Match History</h1>
          <p className="text-muted-foreground">All recorded chess matches</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading matches...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <div key={match.match.id} className="glass p-6 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium px-2 py-1 rounded bg-primary/20 text-primary">
                      {match.match.timeCategory === '5min' ? '5 Min' : '10 Min'}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(match.match.playedAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <span className={`font-medium ${getResultColor(match.match.result)}`}>
                    {getResultText(match)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <div className="text-right">
                    <div className="font-bold">{match.whitePlayer?.name || 'Unknown'}</div>
                    <div className="text-sm text-muted-foreground">White</div>
                    <div className="text-xs mt-1">
                      {match.match.whiteEloBefore} → {match.match.whiteEloAfter}
                      <span className={match.match.whiteEloChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {' '}({match.match.whiteEloChange >= 0 ? '+' : ''}{match.match.whiteEloChange})
                      </span>
                    </div>
                  </div>

                  <div className="text-center text-2xl font-bold text-muted-foreground">
                    VS
                  </div>

                  <div>
                    <div className="font-bold">{match.blackPlayer?.name || 'Unknown'}</div>
                    <div className="text-sm text-muted-foreground">Black</div>
                    <div className="text-xs mt-1">
                      {match.match.blackEloBefore} → {match.match.blackEloAfter}
                      <span className={match.match.blackEloChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {' '}({match.match.blackEloChange >= 0 ? '+' : ''}{match.match.blackEloChange})
                      </span>
                    </div>
                  </div>
                </div>

                {match.match.notes && (
                  <div className="mt-4 pt-4 border-t border-border/50 text-sm text-muted-foreground">
                    {match.match.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

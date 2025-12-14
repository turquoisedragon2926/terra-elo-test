'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/header';
import { LeaderboardTable } from '@/components/leaderboard/leaderboard-table';
import { TimeCategoryTabs } from '@/components/leaderboard/time-category-tabs';
import { AddPlayerDialog } from '@/components/players/add-player-dialog';
import type { PlayerWithStats } from '@/types';

export default function HomePage() {
  const [timeCategory, setTimeCategory] = useState<'5min' | '10min'>('5min');
  const [players, setPlayers] = useState<PlayerWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/players?timeCategory=${timeCategory}`);
      const data = await response.json();
      setPlayers(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }, [timeCategory]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Chess ELO Leaderboard
          </h1>
          <p className="text-muted-foreground">
            Track and compete with your Terra AI teammates
          </p>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <TimeCategoryTabs value={timeCategory} onValueChange={setTimeCategory} />
          <AddPlayerDialog onPlayerAdded={fetchLeaderboard} />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading leaderboard...</p>
          </div>
        ) : (
          <LeaderboardTable players={players} />
        )}
      </main>
    </div>
  );
}

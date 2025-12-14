'use client';

import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { PlayerWithStats } from '@/types';

interface LeaderboardTableProps {
  players: PlayerWithStats[];
}

export function LeaderboardTable({ players }: LeaderboardTableProps) {
  if (players.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No players found
      </div>
    );
  }

  return (
    <div className="glass rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Rank</TableHead>
            <TableHead>Player</TableHead>
            <TableHead className="text-right">ELO</TableHead>
            <TableHead className="text-right">Games</TableHead>
            <TableHead className="text-right">W-L-D</TableHead>
            <TableHead className="text-right">Win Rate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player) => {
            const winRate =
              player.rating.gamesPlayed > 0
                ? ((player.rating.wins / player.rating.gamesPlayed) * 100).toFixed(1)
                : '0.0';

            return (
              <TableRow key={player.id} className="hover:bg-white/5">
                <TableCell className="font-medium">
                  <span
                    className={
                      player.rank === 1
                        ? 'text-yellow-500'
                        : player.rank === 2
                        ? 'text-gray-400'
                        : player.rank === 3
                        ? 'text-amber-700'
                        : ''
                    }
                  >
                    #{player.rank}
                  </span>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/players/${player.id}`}
                    className="font-medium hover:text-primary transition-colors"
                  >
                    {player.name}
                  </Link>
                </TableCell>
                <TableCell className="text-right font-bold text-primary">
                  {player.rating.currentElo}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {player.rating.gamesPlayed}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {player.rating.wins}-{player.rating.losses}-{player.rating.draws}
                </TableCell>
                <TableCell className="text-right">
                  {winRate}%
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

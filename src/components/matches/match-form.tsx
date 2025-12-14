'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Player } from '@/types';

export function MatchForm() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    timeCategory: '5min' as '5min' | '10min',
    whitePlayerId: '',
    blackPlayerId: '',
    result: '' as 'white_win' | 'black_win' | 'draw' | '',
    playedAt: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    async function fetchPlayers() {
      try {
        const response = await fetch('/api/players');
        const data = await response.json();
        // Ensure data is an array
        if (Array.isArray(data)) {
          setPlayers(data);
        } else {
          console.error('API returned non-array data:', data);
          setPlayers([]);
        }
      } catch (error) {
        console.error('Error fetching players:', error);
        setPlayers([]);
      }
    }

    fetchPlayers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.whitePlayerId || !formData.blackPlayerId || !formData.result) {
      alert('Please fill in all required fields');
      return;
    }

    if (formData.whitePlayerId === formData.blackPlayerId) {
      alert('White and black players must be different');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          playedAt: new Date(formData.playedAt).toISOString(),
        }),
      });

      if (response.ok) {
        router.push('/');
        router.refresh();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating match:', error);
      alert('Failed to create match');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle>Record a Chess Match</CardTitle>
        <CardDescription>Enter the match details to update player ratings</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="timeCategory">Time Category</Label>
            <Select
              value={formData.timeCategory}
              onValueChange={(value) => setFormData({ ...formData, timeCategory: value as '5min' | '10min' })}
            >
              <SelectTrigger id="timeCategory">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5min">5 Minute Blitz</SelectItem>
                <SelectItem value="10min">10 Minute Rapid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="whitePlayer">White Player</Label>
              <Select
                value={formData.whitePlayerId}
                onValueChange={(value) => setFormData({ ...formData, whitePlayerId: value })}
              >
                <SelectTrigger id="whitePlayer">
                  <SelectValue placeholder="Select player" />
                </SelectTrigger>
                <SelectContent>
                  {players.map((player) => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="blackPlayer">Black Player</Label>
              <Select
                value={formData.blackPlayerId}
                onValueChange={(value) => setFormData({ ...formData, blackPlayerId: value })}
              >
                <SelectTrigger id="blackPlayer">
                  <SelectValue placeholder="Select player" />
                </SelectTrigger>
                <SelectContent>
                  {players.map((player) => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="result">Result</Label>
            <Select
              value={formData.result}
              onValueChange={(value) => setFormData({ ...formData, result: value as 'white_win' | 'black_win' | 'draw' })}
            >
              <SelectTrigger id="result">
                <SelectValue placeholder="Select result" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="white_win">White Wins</SelectItem>
                <SelectItem value="black_win">Black Wins</SelectItem>
                <SelectItem value="draw">Draw</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="playedAt">Date Played</Label>
            <Input
              id="playedAt"
              type="date"
              value={formData.playedAt}
              onChange={(e) => setFormData({ ...formData, playedAt: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              type="text"
              placeholder="Add any notes about this match..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              maxLength={500}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating Match...' : 'Record Match'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

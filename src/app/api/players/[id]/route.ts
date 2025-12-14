import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { players, playerRatings, matches, eloHistory } from '@/lib/db/schema';
import { eq, or, desc } from 'drizzle-orm';

// GET /api/players/[id] - Fetch player details with stats
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch player with ratings
    const player = await db.query.players.findFirst({
      where: eq(players.id, id),
      with: {
        ratings: true,
      },
    });

    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    // Fetch recent matches for this player
    const recentMatches = await db
      .select()
      .from(matches)
      .where(
        or(
          eq(matches.whitePlayerId, id),
          eq(matches.blackPlayerId, id)
        )
      )
      .orderBy(desc(matches.playedAt))
      .limit(10);

    // Fetch ELO history for charts (both time categories)
    const history5min = await db
      .select()
      .from(eloHistory)
      .where(
        eq(eloHistory.playerId, id) &&
        eq(eloHistory.timeCategory, '5min')
      )
      .orderBy(eloHistory.recordedAt)
      .limit(50);

    const history10min = await db
      .select()
      .from(eloHistory)
      .where(
        eq(eloHistory.playerId, id) &&
        eq(eloHistory.timeCategory, '10min')
      )
      .orderBy(eloHistory.recordedAt)
      .limit(50);

    return NextResponse.json({
      player,
      recentMatches,
      eloHistory: {
        '5min': history5min,
        '10min': history10min,
      },
    });
  } catch (error) {
    console.error('Error fetching player details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player details' },
      { status: 500 }
    );
  }
}

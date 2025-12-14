import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { players, playerRatings } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { playerQuerySchema } from '@/lib/validations/schemas';

// GET /api/players - Fetch all players with their ratings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = playerQuerySchema.parse({
      timeCategory: searchParams.get('timeCategory'),
    });

    // Fetch all players with their ratings
    const allPlayers = await db.query.players.findMany({
      with: {
        ratings: true,
      },
      orderBy: (players, { asc }) => [asc(players.name)],
    });

    // If time category filter is specified, enhance with ranking
    if (params.timeCategory) {
      // Get ratings for the specific time category, sorted by ELO
      const ratingsWithPlayers = await db
        .select()
        .from(playerRatings)
        .leftJoin(players, eq(playerRatings.playerId, players.id))
        .where(eq(playerRatings.timeCategory, params.timeCategory))
        .orderBy(desc(playerRatings.currentElo));

      // Add rank to each player
      const playersWithRank = ratingsWithPlayers.map((row, index) => ({
        ...row.players,
        rating: row.player_ratings,
        rank: index + 1,
      }));

      return NextResponse.json(playersWithRank);
    }

    return NextResponse.json(allPlayers);
  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json(
      { error: 'Failed to fetch players' },
      { status: 500 }
    );
  }
}

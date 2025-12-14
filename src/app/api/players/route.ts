import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { players, playerRatings } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { playerQuerySchema, createPlayerSchema } from '@/lib/validations/schemas';

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

// POST /api/players - Create a new player
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const playerData = createPlayerSchema.parse(body);

    // Insert player
    const [newPlayer] = await db
      .insert(players)
      .values({ name: playerData.name })
      .returning();

    // Create ratings for both time categories
    await db.insert(playerRatings).values([
      {
        playerId: newPlayer.id,
        timeCategory: '5min',
        currentElo: 1000,
        peakElo: 1000,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
      },
      {
        playerId: newPlayer.id,
        timeCategory: '10min',
        currentElo: 1000,
        peakElo: 1000,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
      },
    ]);

    return NextResponse.json(newPlayer, { status: 201 });
  } catch (error) {
    console.error('Error creating player:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create player' },
      { status: 500 }
    );
  }
}

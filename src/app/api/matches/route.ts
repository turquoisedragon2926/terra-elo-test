import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { matches, playerRatings, eloHistory, players } from '@/lib/db/schema';
import { and, eq, or, desc, sql } from 'drizzle-orm';
import { createMatchSchema, matchesQuerySchema } from '@/lib/validations/schemas';
import { processMatchResult } from '@/lib/elo/calculator';
import { alias } from 'drizzle-orm/pg-core';

// Create aliases for joining players table twice
const whitePlayer = alias(players, 'white_player');
const blackPlayer = alias(players, 'black_player');

// GET /api/matches - Fetch matches with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = matchesQuerySchema.parse({
      timeCategory: searchParams.get('timeCategory'),
      playerId: searchParams.get('playerId'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    });

    let whereConditions = [];

    if (params.timeCategory) {
      whereConditions.push(eq(matches.timeCategory, params.timeCategory));
    }

    if (params.playerId) {
      whereConditions.push(
        or(
          eq(matches.whitePlayerId, params.playerId),
          eq(matches.blackPlayerId, params.playerId)
        )
      );
    }

    const whereClause = whereConditions.length > 0
      ? and(...whereConditions)
      : undefined;

    // Fetch matches with player details using aliases
    const matchList = await db
      .select({
        match: matches,
        whitePlayer: whitePlayer,
        blackPlayer: blackPlayer,
      })
      .from(matches)
      .leftJoin(whitePlayer, eq(matches.whitePlayerId, whitePlayer.id))
      .leftJoin(blackPlayer, eq(matches.blackPlayerId, blackPlayer.id))
      .where(whereClause)
      .orderBy(desc(matches.playedAt))
      .limit(params.limit)
      .offset(params.offset);

    return NextResponse.json(matchList);
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    );
  }
}

// POST /api/matches - Create a new match and update ELOs
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const matchData = createMatchSchema.parse(body);

    // Start a transaction to ensure atomic updates
    const result = await db.transaction(async (tx) => {
      // Fetch current ratings for both players for the specific time category
      const [whiteRating, blackRating] = await Promise.all([
        tx.query.playerRatings.findFirst({
          where: and(
            eq(playerRatings.playerId, matchData.whitePlayerId),
            eq(playerRatings.timeCategory, matchData.timeCategory)
          ),
        }),
        tx.query.playerRatings.findFirst({
          where: and(
            eq(playerRatings.playerId, matchData.blackPlayerId),
            eq(playerRatings.timeCategory, matchData.timeCategory)
          ),
        }),
      ]);

      if (!whiteRating || !blackRating) {
        throw new Error('Player ratings not found');
      }

      // Calculate new ELOs
      const eloResult = processMatchResult(
        { elo: whiteRating.currentElo, gamesPlayed: whiteRating.gamesPlayed },
        { elo: blackRating.currentElo, gamesPlayed: blackRating.gamesPlayed },
        matchData.result
      );

      // Insert the match record
      const [newMatch] = await tx
        .insert(matches)
        .values({
          timeCategory: matchData.timeCategory,
          whitePlayerId: matchData.whitePlayerId,
          blackPlayerId: matchData.blackPlayerId,
          result: matchData.result,
          whiteEloBefore: eloResult.white.eloBefore,
          blackEloBefore: eloResult.black.eloBefore,
          whiteEloAfter: eloResult.white.eloAfter,
          blackEloAfter: eloResult.black.eloAfter,
          whiteEloChange: eloResult.white.eloChange,
          blackEloChange: eloResult.black.eloChange,
          playedAt: matchData.playedAt,
          notes: matchData.notes,
        })
        .returning();

      // Update player ratings for white player
      const whiteStats = calculateMatchStats(matchData.result, 'white');
      await tx
        .update(playerRatings)
        .set({
          currentElo: eloResult.white.eloAfter,
          peakElo: Math.max(whiteRating.peakElo, eloResult.white.eloAfter),
          gamesPlayed: whiteRating.gamesPlayed + 1,
          wins: whiteRating.wins + whiteStats.wins,
          losses: whiteRating.losses + whiteStats.losses,
          draws: whiteRating.draws + whiteStats.draws,
          updatedAt: new Date(),
        })
        .where(eq(playerRatings.id, whiteRating.id));

      // Update player ratings for black player
      const blackStats = calculateMatchStats(matchData.result, 'black');
      await tx
        .update(playerRatings)
        .set({
          currentElo: eloResult.black.eloAfter,
          peakElo: Math.max(blackRating.peakElo, eloResult.black.eloAfter),
          gamesPlayed: blackRating.gamesPlayed + 1,
          wins: blackRating.wins + blackStats.wins,
          losses: blackRating.losses + blackStats.losses,
          draws: blackRating.draws + blackStats.draws,
          updatedAt: new Date(),
        })
        .where(eq(playerRatings.id, blackRating.id));

      // Insert ELO history records for both players
      await tx.insert(eloHistory).values([
        {
          playerId: matchData.whitePlayerId,
          matchId: newMatch.id,
          timeCategory: matchData.timeCategory,
          eloBefore: eloResult.white.eloBefore,
          eloAfter: eloResult.white.eloAfter,
          eloChange: eloResult.white.eloChange,
          recordedAt: matchData.playedAt,
        },
        {
          playerId: matchData.blackPlayerId,
          matchId: newMatch.id,
          timeCategory: matchData.timeCategory,
          eloBefore: eloResult.black.eloBefore,
          eloAfter: eloResult.black.eloAfter,
          eloChange: eloResult.black.eloChange,
          recordedAt: matchData.playedAt,
        },
      ]);

      return newMatch;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating match:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create match' },
      { status: 500 }
    );
  }
}

// Helper function to calculate match stats for a player
function calculateMatchStats(result: 'white_win' | 'black_win' | 'draw', color: 'white' | 'black') {
  if (result === 'draw') {
    return { wins: 0, losses: 0, draws: 1 };
  }

  const won = (result === 'white_win' && color === 'white') ||
               (result === 'black_win' && color === 'black');

  return won
    ? { wins: 1, losses: 0, draws: 0 }
    : { wins: 0, losses: 1, draws: 0 };
}

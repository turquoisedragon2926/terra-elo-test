import { db } from './client';
import { players, playerRatings } from './schema';

const teamMembers = [
  'John Mern',
  'Anthony Corso',
  'Luke Ren',
  'Markus Zechner',
  'Arec Jamgochian',
  'William Davis',
  'Alex Bryk',
  'John Godlewski',
  'Danny Donahue',
  'Kyle Clark',
  'Richard Rex',
  'Brandon Bowersox-Johnson',
  'Jake Popham',
  'Harrison Delecki',
];

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // Insert all players
    console.log('📝 Inserting players...');
    const insertedPlayers = await db
      .insert(players)
      .values(
        teamMembers.map((name) => ({
          name,
        }))
      )
      .returning();

    console.log(`✅ Inserted ${insertedPlayers.length} players`);

    // Create ratings for each player (both 5min and 10min)
    console.log('⭐ Creating player ratings...');
    const ratingsToInsert = insertedPlayers.flatMap((player) => [
      {
        playerId: player.id,
        timeCategory: '5min' as const,
        currentElo: 1000,
        peakElo: 1000,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
      },
      {
        playerId: player.id,
        timeCategory: '10min' as const,
        currentElo: 1000,
        peakElo: 1000,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
      },
    ]);

    await db.insert(playerRatings).values(ratingsToInsert);

    console.log(`✅ Created ${ratingsToInsert.length} rating records (2 per player)`);
    console.log('🎉 Seed completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log('✨ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

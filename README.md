# Terra AI Chess ELO Tracker

A modern chess ELO rating tracker for the Terra AI team, featuring separate ratings for different time controls (5 minute blitz and 10 minute rapid).

## Features

- **Dual Time Controls**: Separate ELO ratings for 5-minute and 10-minute games
- **Leaderboard**: Real-time rankings with game statistics
- **Match History**: Complete record of all games with ELO changes
- **ELO Calculation**: Standard chess ELO algorithm with dynamic K-factors
- **Dark Theme**: Glassmorphic UI matching Terra AI's branding
- **Self-Reported Matches**: Trust-based match entry system

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API Routes
- **Database**: Vercel Postgres (Neon)
- **ORM**: Drizzle ORM
- **Validation**: Zod
- **Charts**: Recharts (ready for future enhancements)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Vercel Postgres

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create a new project or select existing project
3. Go to Storage tab and create a Vercel Postgres database
4. Copy the connection strings

### 3. Configure Environment Variables

Update `.env.local` with your actual database credentials:

```bash
POSTGRES_URL="your-postgres-url"
POSTGRES_PRISMA_URL="your-prisma-url"
POSTGRES_URL_NON_POOLING="your-non-pooling-url"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Set Up Database

Generate and push the database schema:

```bash
npm run db:generate
npm run db:push
```

### 5. Seed Initial Data

Seed the database with the 14 Terra AI team members:

```bash
npm run db:seed
```

This will create all 14 players with starting ELO of 1000 for both time categories.

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Usage

### Recording a Match

1. Click "Add Match" in the navigation
2. Select time category (5min or 10min)
3. Select white and black players
4. Choose the result (White wins, Black wins, or Draw)
5. Set the date (can backdate matches)
6. Add optional notes
7. Submit to update ELOs automatically

### Viewing Leaderboard

- Toggle between 5-minute and 10-minute tabs
- See rankings, current ELO, games played, W-L-D records, and win rates
- Click on player names to view detailed profiles (coming soon)

### Match History

- View all recorded matches chronologically
- See ELO changes for both players
- Filter by time category or player

## Database Schema

### Players
- Core player information

### Player Ratings
- Separate rating records for each time category per player
- Tracks current ELO, peak ELO, games played, wins, losses, draws

### Matches
- Complete match records with ELO snapshots
- Stores ELO before/after for both players

### ELO History
- Time-series data for rating charts (future enhancement)

## Deployment to Vercel

### Option 1: Deploy via GitHub

1. Push code to GitHub repository
2. Go to [Vercel Dashboard](https://vercel.com/new)
3. Import your repository
4. Add environment variables in Vercel project settings
5. Deploy

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Post-Deployment

1. Set up Vercel Postgres in production (if not already done)
2. Add environment variables in Vercel dashboard
3. Run migrations:
   ```bash
   vercel env pull .env.local
   npm run db:push
   npm run db:seed
   ```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Drizzle Studio (database GUI)
- `npm run db:seed` - Seed initial player data

## ELO Calculation

The app uses the standard chess ELO formula:

- **Expected Score**: `E = 1 / (1 + 10^((R_opponent - R_player) / 400))`
- **New Rating**: `R_new = R_old + K * (S - E)`
- **K-Factor**:
  - 40 for players with < 30 games (provisional)
  - 32 for established players

## Team Members

The system is seeded with 14 Terra AI team members:
1. John Mern
2. Anthony Corso
3. Luke Ren
4. Markus Zechner
5. Arec Jamgochian
6. William Davis
7. Alex Bryk
8. John Godlewski
9. Danny Donahue
10. Kyle Clark
11. Richard Rex
12. Brandon Bowersox-Johnson
13. Jake Popham
14. Harrison Delecki

## Future Enhancements

- Player profile pages with rating charts
- Head-to-head records
- Advanced statistics
- Authentication
- Match editing/deletion
- Player avatars
- Export to CSV
- Tournament mode
- Additional time categories (3min bullet, 15min rapid)

## License

Built for Terra AI internal use.

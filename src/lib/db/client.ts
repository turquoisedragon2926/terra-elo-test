import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from './schema';

// Create the connection pool with transaction support
const pool = new Pool({ connectionString: process.env.POSTGRES_URL! });

// Export the database instance with schema for type-safe queries
export const db = drizzle(pool, { schema });

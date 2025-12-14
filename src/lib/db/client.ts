import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Create the connection
const sql = neon(process.env.POSTGRES_URL!);

// Export the database instance with schema for type-safe queries
export const db = drizzle(sql, { schema });

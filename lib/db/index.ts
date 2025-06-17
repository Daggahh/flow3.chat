import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Initialize postgres client for database operations
const client = postgres(process.env.POSTGRES_URL!);

// Initialize drizzle with the postgres client
export const db = drizzle(client);

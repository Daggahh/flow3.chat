import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { readFile } from 'fs/promises';
import { join } from 'path';

config({
  path: '.env.local',
});

const runMigrate = async () => {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is not defined');
  }

  const connection = postgres(process.env.POSTGRES_URL, { max: 1 });
  const db = drizzle(connection);
  console.log('⏳ Running migrations...');

  const start = Date.now();
  await migrate(db, { migrationsFolder: './lib/db/migrations' });
    // Check if RLS policies exist
  const policyCheck = await db.execute(
    `SELECT 1 FROM pg_policy WHERE polrelid = '"User"'::regclass LIMIT 1;`
  ).catch(() => []);
  
  // Only apply RLS if policies don't exist
  if (!policyCheck?.length) {
    console.log('⏳ Setting up Row Level Security policies...');
    const rlsSql = await readFile(
      join(process.cwd(), 'lib', 'db', 'migrations', '0007_auth_sync.sql'),
      'utf-8',
    );
    await db.execute(rlsSql);
  } else {
    console.log('✓ RLS policies already exist, skipping...');
  }
  
  const end = Date.now();

  console.log('✅ Migrations completed in', end - start, 'ms');
  process.exit(0);
};

runMigrate().catch((err) => {
  console.error('❌ Migration failed');
  console.error(err);
  process.exit(1);
});

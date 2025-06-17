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
  // Check if base RLS policies exist
  const policyCheck = await db.execute(
    `SELECT 1 FROM pg_policy WHERE polrelid = '"User"'::regclass LIMIT 1;`
  ).catch(() => []);
  
  // Check if API key policies exist
  const apiKeyPolicyCheck = await db.execute(
    `SELECT 1 FROM pg_policy WHERE polrelid = '"ApiKey"'::regclass LIMIT 1;`
  ).catch(() => []);

  // Apply base RLS policies if they don't exist
  if (!policyCheck?.length) {
    console.log('⏳ Setting up base Row Level Security policies...');
    const rlsSql = await readFile(
      join(process.cwd(), 'lib', 'db', 'migrations', '0007_auth_sync.sql'),
      'utf-8',
    );
    await db.execute(rlsSql);
  } else {
    console.log('✓ Base RLS policies already exist, skipping...');
  }

  // Apply API key policies if they don't exist
  if (!apiKeyPolicyCheck?.length) {
    console.log('⏳ Setting up API key policies...');    const apiKeyRlsSql = await readFile(
      join(process.cwd(), 'lib', 'db', 'migrations', '0008_latest_api_key_storage.sql'),
      'utf-8',
    );
    await db.execute(apiKeyRlsSql);
  } else {
    console.log('✓ API key policies already exist, skipping...');
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

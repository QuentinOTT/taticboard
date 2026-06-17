import fs from 'fs';
import path from 'path';
import pool from './client';

async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).sort();

  for (const file of files) {
    if (!file.endsWith('.sql')) continue;
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    console.log(`Running migration: ${file}`);
    await pool.query(sql);
    console.log(`✓ Migration ${file} completed`);
  }
}

async function runSeeds() {
  const seedsDir = path.join(__dirname, 'seeds');
  const files = fs.readdirSync(seedsDir).sort();

  for (const file of files) {
    if (!file.endsWith('.sql')) continue;
    const sql = fs.readFileSync(path.join(seedsDir, file), 'utf-8');
    console.log(`Running seed: ${file}`);
    await pool.query(sql);
    console.log(`✓ Seed ${file} completed`);
  }
}

export async function initDatabase() {
  try {
    console.log('🔄 Running database migrations...');
    await runMigrations();
    console.log('🌱 Running database seeds...');
    await runSeeds();
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// Allow running as standalone script
if (require.main === module) {
  initDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

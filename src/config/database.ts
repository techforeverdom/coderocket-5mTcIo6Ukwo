import { Pool } from 'pg';
import { config } from './config';

// Create PostgreSQL connection pool
export const db = new Pool({
  connectionString: config.database.url,
  ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
db.on('connect', () => {
  console.log('📊 Connected to PostgreSQL database');
});

db.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing database connections...');
  await db.end();
});

process.on('SIGTERM', async () => {
  console.log('Closing database connections...');
  await db.end();
});
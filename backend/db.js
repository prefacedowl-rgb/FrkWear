import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error('CRITICAL: DATABASE_URL is not set in environment variables.');
  process.exit(1);
}

// Create pg connection pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Necessary for connection to Supabase hosted DBs
  }
});

// Helper for query execution
export const query = (text, params) => pool.query(text, params);

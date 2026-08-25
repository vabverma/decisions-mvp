import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

let _pool: Pool | null = null;

const getPool = (): Pool => {
  if (!_pool) {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL not configured');
    }
    _pool = new Pool({ connectionString: dbUrl });
  }
  return _pool;
};

// Create a proxy to make pool act like a Pool instance while maintaining lazy loading
const pool = new Proxy({} as Pool, {
  get: (target, prop) => {
    return (getPool() as any)[prop];
  },
});

export async function initializeDatabase(): Promise<void> {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');

  try {
    await getPool().query(schema);
    console.log('✅ Database schema initialized');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// Runs independently of the main schema (which no-ops once the core tables
// exist) so new tables reach already-provisioned databases without a full
// migration framework.
export async function ensureAdditionalTables(): Promise<void> {
  await getPool().query(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash VARCHAR(255) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      used_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token_hash ON password_reset_tokens(token_hash);
  `);
}

export { pool, getPool };

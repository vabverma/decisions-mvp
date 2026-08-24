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

export { pool, getPool };

import pg from 'pg';
import { env } from '../config/env.js';

const { Pool } = pg;

const getConnectionString = () => {
  if (!env.databaseSsl || !env.databaseUrl) return env.databaseUrl;

  const databaseUrl = new URL(env.databaseUrl);
  databaseUrl.searchParams.delete('sslmode');
  databaseUrl.searchParams.delete('sslcert');
  databaseUrl.searchParams.delete('sslkey');
  databaseUrl.searchParams.delete('sslrootcert');
  databaseUrl.searchParams.delete('uselibpqcompat');
  return databaseUrl.toString();
};

export const pool = new Pool({
  connectionString: getConnectionString(),
  ssl: env.databaseSsl ? { rejectUnauthorized: false } : undefined
});

export const query = (text, params) => pool.query(text, params);

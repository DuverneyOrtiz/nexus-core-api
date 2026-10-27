import "dotenv/config";

import { drizzle as drizzleSupabase } from "drizzle-orm/postgres-js";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';

// Modo de conexión
import { Pool } from "pg";
import supabase from "postgres";
import { neon } from '@neondatabase/serverless';

export const FPostgres = () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
  });

  return drizzlePg({ client: pool });
};

export const FSupabase = () => {
  const client = supabase(process.env.DATABASE_URL!, { prepare: false });
  return drizzleSupabase(client);
};

export const FNeon = () => {
  const sql = neon(process.env.DATABASE_URL!);
  return drizzleNeon({ client: sql });
}

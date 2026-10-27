import { FNeon, FPostgres, FSupabase } from "./postgres.connection.js";
import { FMysql } from "./mysql.connection.js";

export class PoolConnection {
  mysql = () => FMysql()
  postgres = () => FPostgres()
  supabase = () => FSupabase()
  neon = () => FNeon()
}

export const db = new PoolConnection().mysql();

import "dotenv/config";

import { drizzle } from "drizzle-orm/mysql2";

// Modo de conexión
import mysql from "mysql2/promise";

export const FMysql = () => {
  const pool = mysql.createPool({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        database: process.env.DATABASE_NAME,
        port: Number(process.env.DATABASE_PORT || 3306),
        password: process.env.DATABASE_PASSWORD,
        waitForConnections: true,
        connectionLimit: Number(process.env.DATABASE_CONNECTION_LIMIT || 10),
      });
  
      return drizzle({ client: pool });
};

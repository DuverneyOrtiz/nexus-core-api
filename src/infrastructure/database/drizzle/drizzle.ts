import { DIALECT } from "@/shared/enums/dialect-drizzle.enum";
import { defineConfig } from "drizzle-kit";

type Dialect = "mysql" | "postgresql" | "supabase" | "neon";

export class Drizzle {

  defineConfiguration = () => {
    const dialect = process.env.DATABASE_DIALECT as Dialect
    return defineConfig({
      out: "./src/infrastructure/database/drizzle/migrations",
      schema: "./src/infrastructure/database/drizzle/schema.ts",
      dialect: DIALECT[dialect],
      dbCredentials: {
        url: process.env.DATABASE_URL!,
      },
    });
  };
}
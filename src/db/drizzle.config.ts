import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
const sqlHost = process.env.SQL_HOST;
const sqlDbName = process.env.SQL_DB_NAME;
const user = process.env.SQL_ADMIN_USER || process.env.SQL_USER;
const password = process.env.SQL_ADMIN_PASSWORD || process.env.SQL_PASSWORD;

if (!databaseUrl) {
  if (!sqlHost) {
    throw new Error("Either DATABASE_URL or SQL_HOST must be set in environment variables.");
  }
  if (!sqlDbName) {
    throw new Error("SQL_DB_NAME must be set in environment variables.");
  }
  if (!user) {
    throw new Error("SQL_ADMIN_USER or SQL_USER must be set in environment variables.");
  }
  if (!password) {
    throw new Error("SQL_ADMIN_PASSWORD or SQL_PASSWORD must be set in environment variables.");
  }
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: ["public"],
  dbCredentials: databaseUrl 
    ? {
        url: databaseUrl,
        ssl: databaseUrl.includes("supabase.co") ? { rejectUnauthorized: false } : undefined,
      }
    : {
        host: sqlHost!,
        user: user!,
        password: password!,
        database: sqlDbName!,
        ssl: false,
      },
  verbose: true,
});

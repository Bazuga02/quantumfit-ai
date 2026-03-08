import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../shared/schema";

if (!process.env.DATABASE_URL) {
  console.error('[db] DATABASE_URL is not set - API will fail');
  throw new Error("DATABASE_URL is not set");
}

// Create a connection pool
const sql = neon(process.env.DATABASE_URL, {
  fullResults: true
});

// Create the Drizzle instance
export const db = drizzle(sql, { schema }); 
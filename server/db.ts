// TOP LEVEL LOG - This should always appear
console.log('=== DATABASE MODULE LOADING START ===');

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../shared/schema";

const timestamp = new Date().toISOString();
console.log(`[${timestamp}] [db] ===== DATABASE INITIALIZATION =====`);
console.log(`[${timestamp}] [db] DATABASE_URL present:`, !!process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
  console.error(`[${timestamp}] [db] DATABASE_URL is not set - API will fail`);
  console.error(`[${timestamp}] [db] Available env vars:`, Object.keys(process.env).filter(k => k.includes('DB') || k.includes('DATABASE')));
  throw new Error("DATABASE_URL is not set");
}

console.log(`[${timestamp}] [db] Creating Neon connection...`);

// Create a connection pool
const sql = neon(process.env.DATABASE_URL, {
  fullResults: true
});

console.log(`[${timestamp}] [db] Creating Drizzle instance...`);

// Create the Drizzle instance
export const db = drizzle(sql, { schema });

console.log(`[${timestamp}] [db] Database initialized successfully`);
console.log('=== DATABASE MODULE LOADING COMPLETE ===');
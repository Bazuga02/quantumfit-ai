import { neon } from "@neondatabase/serverless";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// ES modules equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const sql = neon(process.env.DATABASE_URL);

async function runMigration() {
  try {
    // Read the migration files
    const migrationFiles = [
      '002_progress_photos.sql'
    ];

    for (const migrationFile of migrationFiles) {
      const migrationPath = path.join(__dirname, 'migrations', migrationFile);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

      // Split the SQL into individual statements
      const statements = migrationSQL.split(';').filter(stmt => stmt.trim());

      // Execute each statement
      for (const statement of statements) {
        if (statement.trim()) {
          console.log('Executing:', statement.trim().substring(0, 100) + '...');
          await sql(statement);
        }
      }
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

runMigration().catch(console.error); 
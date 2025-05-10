import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../shared/schema';
import { eq } from 'drizzle-orm';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const main = async () => {
  try {
    // Update the password for the specific user
    await db.update(schema.users)
      .set({ password: '123456' })
      .where(eq(schema.users.email, 'abhirai4403@gmail.com'));

    console.log('Password updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating password:', error);
    process.exit(1);
  }
};

main(); 
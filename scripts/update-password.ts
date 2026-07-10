import "dotenv/config";
import bcrypt from "bcrypt";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../shared/schema";
import { eq } from "drizzle-orm";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const main = async () => {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error("Usage: npm run db:update-password -- <email> <password>");
    process.exit(1);
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db
      .update(schema.users)
      .set({ password: hashedPassword })
      .where(eq(schema.users.email, email));

    console.log("Password updated successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error updating password:", error);
    process.exit(1);
  }
};

main();

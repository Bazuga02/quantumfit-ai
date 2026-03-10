/**
 * Load .env from project root before any other server code runs.
 * Must be the first import in server/index.ts so DATABASE_URL etc. are set
 * before db.ts, storage.ts, or routes are loaded.
 */
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
dotenv.config({ path: path.join(root, ".env") });
dotenv.config({ path: path.join(root, ".env.local") });

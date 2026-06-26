import bcrypt from "bcrypt";
import { getGuestConfigOrNull } from "./guest-config.js";
import { storage } from "./storage.js";

export async function ensureGuestUser(): Promise<void> {
  const config = getGuestConfigOrNull();
  if (!config) {
    console.warn(
      "Guest login disabled: set GUEST_EMAIL, GUEST_PASSWORD, and GUEST_NAME in .env"
    );
    return;
  }

  const { email, password, name } = config;

  try {
    const existing = await storage.getUserByEmail(email);

    if (!existing) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await storage.createUser({
        name,
        email,
        password: hashedPassword,
      });
      console.log("Guest account created");
      return;
    }

    const passwordMatch = await bcrypt.compare(password, existing.password);
    if (!passwordMatch) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await storage.updateUser(existing.id, { password: hashedPassword });
      console.log("Guest account password synced");
    }
  } catch (error) {
    console.error("Failed to ensure guest account:", error);
  }
}

export type GuestConfig = {
  email: string;
  password: string;
  name: string;
};

/** Returns guest config when all env vars are set; otherwise null. */
export function getGuestConfigOrNull(): GuestConfig | null {
  const email = process.env.GUEST_EMAIL?.trim();
  const password = process.env.GUEST_PASSWORD?.trim();
  const name = process.env.GUEST_NAME?.trim();

  if (!email || !password || !name) {
    return null;
  }

  return { email, password, name };
}

/** Guest demo account — credentials from env only (server-side). */
export function getGuestConfig(): GuestConfig {
  const config = getGuestConfigOrNull();
  if (!config) {
    throw new Error(
      "Guest account requires GUEST_EMAIL, GUEST_PASSWORD, and GUEST_NAME in environment"
    );
  }
  return config;
}

export function isGuestEmail(email: string): boolean {
  const config = getGuestConfigOrNull();
  return config !== null && email === config.email;
}

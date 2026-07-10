export const GUEST_EMAIL_SUFFIX = "@guest.quantumfit.local";

/** Guest JWT lifetime — shorter than registered users. */
export const GUEST_JWT_EXPIRES_IN = "1d";

/** Delete guest rows older than this (default 25h — slightly after 1d JWT). */
export function getGuestSessionMaxAgeMs(): number {
  const fromEnv = process.env.GUEST_MAX_AGE_MS?.trim();
  if (fromEnv) {
    const parsed = Number(fromEnv);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return 25 * 60 * 60 * 1000;
}

/** Guest login is enabled when a display name is configured. */
export function isGuestLoginEnabled(): boolean {
  return Boolean(process.env.GUEST_NAME?.trim());
}

export function getGuestDisplayName(): string {
  return process.env.GUEST_NAME?.trim() || "Guest";
}

export function isGuestEmail(email: string): boolean {
  return email.endsWith(GUEST_EMAIL_SUFFIX);
}

const GUEST_EMAIL_SUFFIX = "@guest.quantumfit.local";

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

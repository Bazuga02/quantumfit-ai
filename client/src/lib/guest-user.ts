const GUEST_EMAIL_SUFFIX = "@guest.quantumfit.local";

export function isGuestUser(user: { email: string } | null | undefined): boolean {
  return Boolean(user?.email?.endsWith(GUEST_EMAIL_SUFFIX));
}

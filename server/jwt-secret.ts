/** JWT signing secret — required in production; dev-only fallback locally. */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (secret) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be set in production");
  }

  return "dev-only-jwt-secret-not-for-production";
}

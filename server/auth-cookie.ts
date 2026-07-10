import type { Response } from "express";

export const AUTH_COOKIE_NAME = "auth_token";
const MAX_AGE_SEC = 7 * 24 * 60 * 60;

function buildCookieHeader(value: string, maxAgeSec: number): string {
  const parts = [
    `${AUTH_COOKIE_NAME}=${encodeURIComponent(value)}`,
    "Path=/",
    `Max-Age=${maxAgeSec}`,
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }
  return parts.join("; ");
}

export function setAuthCookie(res: Response, token: string): void {
  res.setHeader("Set-Cookie", buildCookieHeader(token, MAX_AGE_SEC));
}

export function clearAuthCookie(res: Response): void {
  res.setHeader("Set-Cookie", buildCookieHeader("", 0));
}

export function readAuthCookie(cookieHeader: string | undefined): string | undefined {
  if (!cookieHeader) return undefined;

  for (const part of cookieHeader.split(";")) {
    const [rawKey, ...rawValue] = part.trim().split("=");
    if (rawKey === AUTH_COOKIE_NAME) {
      const value = rawValue.join("=");
      return value ? decodeURIComponent(value) : undefined;
    }
  }

  return undefined;
}

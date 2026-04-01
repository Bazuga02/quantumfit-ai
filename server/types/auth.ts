import type { User } from "../../shared/schema.js";

/** User as stored in session or returned to clients — never includes `password`. */
export type AuthUser = Omit<User, "password">;

/** Claims embedded in the JWT (and returned by `jwt.verify`). */
export type JwtPayload = {
  id: number;
  email: string;
  iat?: number;
  exp?: number;
};

export function toAuthUser(user: User): AuthUser {
  const { password: _p, ...rest } = user;
  return rest;
}

import { stringifySetCookie } from "cookie";
import jwt from "jsonwebtoken";

export type TokenPayload = { user: string; userSecret: string };

export function generateToken(
  username: string,
  userSecret: string,
  jwtSecret: string,
) {
  return jwt.sign({ user: username, userSecret } as TokenPayload, jwtSecret, {
    expiresIn: "7d",
  });
}

export function generateSetCookie(
  username: string,
  userSecret: string,
  jwtSecret: string,
) {
  return stringifySetCookie({
    name: "token",
    value: generateToken(username, userSecret, jwtSecret),
    maxAge: 7 * 24 * 60 * 60, // 7 days
    httpOnly: true,
    secure: true,
    partitioned: true,
    sameSite: "lax",
  });
}

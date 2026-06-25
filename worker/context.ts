import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { parseCookie } from "cookie";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import type { User } from "../types/Users.ts";
import "../worker-configuration.d.ts";
import type { TokenPayload } from "./auth/tokens.ts";

export async function createContext(
  { req, resHeaders }: FetchCreateContextFnOptions,
  env: Env,
) {
  const token = parseCookie(req.headers.get("Cookie") ?? "").token ?? "";

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;

    const user = await env.DB.prepare("SELECT * FROM Users WHERE username = ?")
      .bind(payload.user)
      .first<User>();

    if (!user || user.secret !== payload.userSecret) {
      throw new JsonWebTokenError("Token does not match database record");
    }

    return { req, resHeaders, env, user: payload.user };
  } catch (error: JsonWebTokenError | unknown) {
    return { req, resHeaders, env, user: null };
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>;

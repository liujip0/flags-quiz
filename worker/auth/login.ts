import { TRPCError } from "@trpc/server";
import * as argon2 from "node-argon2";
import zod from "zod";
import type { User } from "../../types/Users.ts";
import { publicProcedure } from "../trpc.ts";
import { generateSetCookie } from "./tokens.ts";

export const login = publicProcedure
  .input(zod.object({ username: zod.string(), password: zod.string() }))
  .mutation(async ({ input, ctx }) => {
    const { DB, JWT_SECRET } = ctx.env;

    const unauthorizedError = new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid username or password",
    });

    const user = await DB.prepare("SELECT * FROM Users WHERE username = ?")
      .bind(input.username)
      .first<User>();

    if (!user) {
      throw unauthorizedError;
    }

    const verify = await argon2.verify({
      hash: user.password,
      password: input.password,
    });

    if (!verify) {
      throw unauthorizedError;
    }

    ctx.resHeaders.set(
      "Set-Cookie",
      generateSetCookie(input.username, user.secret, JWT_SECRET),
    );

    return true;
  });

import zod from "zod";
import { publicProcedure } from "../trpc.ts";
import { TRPCError } from "@trpc/server";
import * as argon2 from "node-argon2";
import jwt from "jsonwebtoken";

export const signup = publicProcedure
  .input(zod.object({ username: zod.string(), password: zod.string() }))
  .mutation(async ({ input, ctx }) => {
    const { DB, JWT_SECRET } = ctx.env;

    const existingUser = await DB.prepare(
      "SELECT COUNT(*) FROM Users WHERE username = ?",
    )
      .bind(input.username)
      .first<number>();

    if (existingUser) {
      throw new TRPCError({ code: "CONFLICT", message: "User already exists" });
    }

    // * Hash params: https://www.rfc-editor.org/rfc/rfc9106.html#name-parameter-choice
    const hash = await argon2.hash(input.password);

    // Used to invalidate already issued session tokens if needed
    const secret = crypto.getRandomValues(new Uint8Array(8)); // 64 bits

    const stmt = await DB.prepare(
      "INSERT INTO Users (username, password, secret) VALUES (?, ?, ?)",
    )
      .bind(input.username, hash, secret)
      .run();

    if (!stmt.success) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create user",
      });
    }

    const token = jwt.sign(
      { user: input.username, secret: secret.toBase64() },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    return token;
  });

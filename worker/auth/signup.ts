import zod from "zod";
import { publicProcedure } from "../trpc.ts";
import { TRPCError } from "@trpc/server";

export const signup = publicProcedure
  .input(zod.object({ username: zod.string(), password: zod.string() }))
  .mutation(async ({ input, ctx }) => {
    const { DB } = ctx.env;

    const existingUser = await DB.prepare(
      "SELECT COUNT(*) FROM Users WHERE username = ?",
    )
      .bind(input.username)
      .first<number>();

    if (existingUser) {
      throw new TRPCError({ code: "CONFLICT", message: "User already exists" });
    }

    const stmt = await DB.prepare(
      "INSERT INTO Users (username, password, secret) VALUES (?, ?, ?)",
    )
      .bind(input.username, input.password, "input.secret")
      .run();

    if (!stmt.success) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create user",
      });
    }
  });

import { TRPCError } from "@trpc/server";
import { argon2Verify, setWASMModules } from "argon2-wasm-edge";
import argon2WASM from "argon2-wasm-edge/wasm/argon2.wasm.json";
import blake2bWASM from "argon2-wasm-edge/wasm/blake2b.wasm.json";
import zod from "zod";
import type { User } from "../../types/Users.ts";
import { publicProcedure } from "../trpc.ts";
import { generateSetCookie } from "./tokens.ts";

setWASMModules({ argon2WASM, blake2bWASM });

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

    const verify = await argon2Verify({
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

    return input.username;
  });

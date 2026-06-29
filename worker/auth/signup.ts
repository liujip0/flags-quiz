import { TRPCError } from "@trpc/server";
import { argon2id, setWASMModules } from "argon2-wasm-edge";
import argon2WASM from "argon2-wasm-edge/wasm/argon2.wasm.json";
import blake2bWASM from "argon2-wasm-edge/wasm/blake2b.wasm.json";
import * as crypto from "node:crypto";
import zod from "zod";
import { publicProcedure } from "../trpc.ts";
import { generateSetCookie } from "./tokens.ts";

setWASMModules({ argon2WASM, blake2bWASM });

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
    const hash = await argon2id({
      password: input.password,
      salt: crypto.getRandomValues(new Uint8Array(16)), // 128 bits
      iterations: 1,
      parallelism: 4,
      memorySize: 2 ** 21, // 2 GiB
      hashLength: 32, // 256 bits
      outputType: "encoded",
    });

    // Used to invalidate already-issued session tokens if needed
    const secret = crypto.getRandomValues(new Uint8Array(8)).toBase64(); // 64 bits

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

    ctx.resHeaders.set(
      "Set-Cookie",
      generateSetCookie(input.username, secret, JWT_SECRET),
    );

    return input.username;
  });

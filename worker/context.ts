import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import "../worker-configuration.d.ts";

export function createContext(
  { req, resHeaders }: FetchCreateContextFnOptions,
  env: Env,
) {
  return { req, resHeaders, env };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

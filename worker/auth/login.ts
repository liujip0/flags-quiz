import zod from "zod";
import { publicProcedure } from "../trpc.ts";

export const login = publicProcedure
  .input(zod.object({ username: zod.string(), password: zod.string() }))
  .mutation(async ({ input, ctx }) => {
    input;
    ctx;
  });

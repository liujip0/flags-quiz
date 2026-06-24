import { router } from "../trpc.ts";
import { login } from "./login.ts";
import { signup } from "./signup.ts";

export const authRouter = router({ login, signup });

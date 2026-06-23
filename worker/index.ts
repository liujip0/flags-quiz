import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createContext } from "./context.ts";
import { appRouter } from "./router.ts";

export default {
  fetch(request) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      return fetchRequestHandler({
        endpoint: "/api",
        req: request,
        router: appRouter,
        createContext,
      });
    }

    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler;

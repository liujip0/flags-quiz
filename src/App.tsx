import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./utils/trpc.ts";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app here */}
    </QueryClientProvider>
  );
}

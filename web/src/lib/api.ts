import type { App } from "@api";
import { treaty } from "@elysiajs/eden";

const baseURL = typeof window !== "undefined" ? "http://localhost:3000/api" : "http://localhost:8000";

// @ts-expect-error - Types mismatch between server and web node_modules
export const api = treaty<App>(baseURL, {
  fetch: {
    credentials: "include",
  },
});

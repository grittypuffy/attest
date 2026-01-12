import type { App } from "@api";
import { treaty } from "@elysiajs/eden";

const baseURL = typeof window !== "undefined"
  ? `${window.location.protocol}//${window.location.host}/api`
  : "http://localhost:3000/api";

export const api = treaty<App>('http://localhost:8000', {
  fetch: {
    credentials: "include",
  },
});

import type { App } from "@api";
import { treaty } from "@elysiajs/eden";

const baseURL = "http://localhost:8000";

export const api = treaty<App>(baseURL, {
  fetch: {
    credentials: "include",
  },
});

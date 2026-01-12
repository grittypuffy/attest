import type { App } from "@api";
import { treaty } from "@elysiajs/eden";

<<<<<<< HEAD
const baseURL = typeof window !== "undefined"
  ? `${window.location.protocol}//${window.location.host}/api`
  : "http://localhost:3000/api";
=======
const baseURL = "http://127.0.0.1:8000";
>>>>>>> onchain

export const api = treaty<App>('http://localhost:8000', {
  fetch: {
    credentials: "include",
  },
});

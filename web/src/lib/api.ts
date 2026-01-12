import type { App } from "@api";
import { treaty } from "@elysiajs/eden";

export const api = treaty<App>("localhost:3000/api", {
    fetch: {
        credentials: "include",
    },
});

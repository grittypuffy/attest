import { Elysia } from "elysia";
import { openapi, fromTypes } from "@elysiajs/openapi";

const app = new Elysia()
  .use(
    openapi({
      references: fromTypes(),
    })
  )
  .get("/ping", () => "Hello Elysia")
  .listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);

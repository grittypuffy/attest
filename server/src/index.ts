import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { openapi, fromTypes } from "@elysiajs/openapi";
import { MongoClient, type Db } from "mongodb";
import type AppState from "./config";
import { signInHandler, signUpHandler } from "./routes/auth";
import { createAgencyHandler } from "./routes/government";

const client = new MongoClient(process.env.MONGODB_URI || "");
const jwtSecret = process.env.JWT_SECRET || "";
await client.connect();
const db: Db = client.db(process.env.MONGODB_DB_NAME);
const userCollection = db.collection("user");
const projectCollection = db.collection("project");

const state: AppState = {
	db: db,
	userCollection: userCollection,
	projectCollection: projectCollection,
	jwtSecret: jwtSecret,
};

const app = new Elysia()
	.use(openapi())
	.use(
		cors({
			origin: process.env.FRONTEND_URL,
			credentials: true,
			methods: "*",
			allowedHeaders: "*",
			exposeHeaders: "*",
			preflight: true,
		}),
	)
	.state("state", state)
	.post(
		"/auth/sign_in",
		async ({ store: { state }, body, cookie: { token } }) => {
			return await signInHandler({ store: { state }, body, cookie: { token } });
		},
	)
  .post(
    "/government/agency/create",
		async ({ store: { state }, body, cookie: { token } }) => {
			return await createAgencyHandler({ store: { state }, body, cookie: { token } });
		}
  )
	.listen(8000);

console.log(
	`Elysia is running at http://${app.server?.hostname}:${app.server?.port}`,
);

import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { openapi, fromTypes } from "@elysiajs/openapi";
import { MongoClient, type Db } from "mongodb";
import type AppState from "./config";
import { getAuthUserHandler, getUserHandler, signInHandler, signUpHandler, verifySessionHandler } from "./routes/auth";
import { createAgencyHandler } from "./routes/government";
import { verify } from "jsonwebtoken";
import { createProjectHandler, getProjectHandler } from "./routes/project";

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
	// Auth
	.post(
		"/auth/sign_in",
		async ({ store: { state }, body, cookie: { token } }) => {
			return await signInHandler({ store: { state }, body, cookie: { token } });
		},
	)
	.get(
		"/auth/user",
		async ({ store: {state}, cookie: {token}}) => {
			return await getAuthUserHandler({store: {state}, cookie: {token} });
		}
	)
	.get(
		"/auth/session/valid",
		async ({store: {state}, cookie: {token}}) => {
			return await verifySessionHandler({store: {state}, cookie: {token}});
		}
	)
	// User
	.get(
		"/user/:user_id",
		async ({ store: {state}, params: {user_id}}) => {
			return await getUserHandler({store: {state}, params: {user_id}})
		}
	)
	// Government
	.post(
		"/government/agency/create",
		async ({ store: { state }, body, cookie: { token } }) => {
			return await createAgencyHandler({
				store: { state },
				body,
				cookie: { token },
			});
		},
	)
	// Project
	.post(
		"/project/create",
		async ({store: {state}, body, cookie: {token}}) => {
			return await createProjectHandler({store: {state}, body, cookie: {token}});
		}
	)
	.get(
		"/project/:project_id",
		async ({store: {state}}) => {
			return await getProjectHandler({store: {state}})
		}
	)
	.listen(8000);

console.log(
	`Elysia is running at http://${app.server?.hostname}:${app.server?.port}`,
);

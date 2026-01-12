import { cors } from "@elysiajs/cors";
import { fromTypes, openapi } from "@elysiajs/openapi";
import { Elysia, t } from "elysia";
import { MongoClient, type Db } from "mongodb";
import type AppState from "./config";
import { SignInRequest, SignUpRequest } from "./models/auth";
import {
	CreateProjectPhasesRequest,
	CreateProjectProposalRequest,
	CreateProjectRequest,
} from "./models/project";
import {
	getAuthUserHandler,
	getUserHandler,
	signInHandler,
	verifySessionHandler,
} from "./routes/auth";
import { createAgencyHandler } from "./routes/government";
import {
	acceptProjectProposalHandler,
	createProjectHandler,
	getProjectHandler,
	getProjectProposalsHandler,
	registerProjectProposalHandler,
	registerProposalPhasesHandler,
} from "./routes/project";

const client = new MongoClient(process.env.MONGODB_URI || "");
const jwtSecret = process.env.JWT_SECRET || "";
await client.connect();
const db: Db = client.db(process.env.MONGODB_DB_NAME);
const userCollection = db.collection("user");
const projectCollection = db.collection("project");
const proposalCollection = db.collection("proposal");
const phaseCollection = db.collection("phase");

const state: AppState = {
	db: db,
	userCollection: userCollection,
	projectCollection: projectCollection,
	proposalCollection: proposalCollection,
	phaseCollection: phaseCollection,
	jwtSecret: jwtSecret,
};

const app = new Elysia()
	.use(
		openapi({
			references: fromTypes(),
		}),
	)
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
	.group("/auth", (app) =>
		app
			.post(
				"/sign_in",
				async ({ store: { state }, body, cookie: { token } }) => {
					return await signInHandler({
						store: { state },
						body,
						cookie: { token },
					});
				},
				{
					body: SignInRequest,
				},
			)
			.get("/user", async ({ store: { state }, cookie: { token } }) => {
				return await getAuthUserHandler({
					store: { state },
					cookie: { token },
				});
			})
			.get(
				"/session/valid",
				async ({ store: { state }, cookie: { token } }) => {
					return await verifySessionHandler({
						store: { state },
						cookie: { token },
					});
				},
			),
	)
	// User
	.get(
		"/user/:user_id",
		async ({ store: { state }, params: { user_id } }) => {
			return await getUserHandler({ store: { state }, params: { user_id } });
		},
		{
			params: t.Object({
				user_id: t.String(),
			}),
		},
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
		{
			body: SignUpRequest,
		},
	)
	// Project
	.group("/project", (app) =>
		app
			.post(
				"/create",
				async ({ store: { state }, body, cookie: { token } }) => {
					return await createProjectHandler({
						store: { state },
						body,
						cookie: { token },
					});
				},
				{
					body: CreateProjectRequest,
				},
			)
			.get(
				"/:project_id",
				async ({ store: { state } }) => {
					return await getProjectHandler({ store: { state } });
				},
				{
					params: t.Object({
						project_id: t.String(),
					}),
				},
			)
			.post(
				"/:project_id/proposal/register",
				async ({ store, cookie: { token }, params: { project_id }, body }) => {
					return await registerProjectProposalHandler({
						store,
						cookie: { token },
						params: { project_id },
						body,
					});
				},
				{
					body: CreateProjectProposalRequest,
					params: t.Object({
						project_id: t.String(),
					}),
				},
			)
			.post(
				"/:project_id/proposal/:proposal_id/phases/register",
				async ({
					store,
					cookie: { token },
					params: { project_id, proposal_id },
					body,
				}) => {
					return await registerProposalPhasesHandler({
						store,
						cookie: { token },
						params: { project_id, proposal_id },
						body,
					});
				},
				{
					params: t.Object({
						project_id: t.String(),
						proposal_id: t.String(),
					}),
					body: CreateProjectPhasesRequest,
				},
			)
			.get(
				"/:project_id/proposal/all",
				async ({ store, params: { project_id } }) => {
					return await getProjectProposalsHandler({
						store,
						params: { project_id },
					});
				},
				{
					params: t.Object({
						project_id: t.String(),
					}),
				},
			)
			.post(
				"/:project_id/proposal/accept",
				async ({ store, cookie: { token }, params: { project_id }, body }) => {
					return await acceptProjectProposalHandler({
						store,
						cookie: { token },
						params: { project_id },
						body,
					});
				},
				{
					params: t.Object({
						project_id: t.String(),
					}),
				},
			),
	)
	.listen(8000);

console.log(
	`Elysia is running at http://${app.server?.hostname}:${app.server?.port}`,
);

export type App = typeof app;

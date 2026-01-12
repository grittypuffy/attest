import { cors } from "@elysiajs/cors";
import { fromTypes, openapi } from "@elysiajs/openapi";
import { Elysia, t } from "elysia";
import { InferenceClient } from "@huggingface/inference";
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
	getNonceHandler,
	getUserHandler,
	signInHandler,
	signOutHandler,
	verifySessionHandler,
	verifySignatureHandler,
} from "./routes/auth";
import { createAgencyHandler } from "./routes/government";
import {
	acceptProjectPhaseHandler,
	acceptProjectProposalHandler,
	createProjectHandler,
	getAllProjectsHandler,
	getProjectHandler,
	getProjectProposalHandler,
	getProjectProposalsHandler,
	registerProjectProposalHandler,
	registerProposalPhasesHandler,
} from "./routes/project";
import {
	getAgencyData,
	getAgencyProjectProposalsHandler,
} from "./routes/agency";
import { generateChatResponse } from "./routes/chat";
import { ChatRequest } from "./models/chat";

const client = new MongoClient(process.env.MONGODB_URI || "");
const jwtSecret = process.env.JWT_SECRET || "";
await client.connect();
const db: Db = client.db(process.env.MONGODB_DB_NAME);
const userCollection = db.collection("user");
const projectCollection = db.collection("project");
const proposalCollection = db.collection("proposal");
const phaseCollection = db.collection("phase");
const inferenceClient = new InferenceClient(process.env.HUGGINGFACE_TOKEN);

const state: AppState = {
	db: db,
	userCollection: userCollection,
	projectCollection: projectCollection,
	proposalCollection: proposalCollection,
	phaseCollection: phaseCollection,
	jwtSecret: jwtSecret,
	inferenceClient: inferenceClient
};

const app = new Elysia()
	.use(
		openapi({
			references: fromTypes(),
		}),
	)
	.use(
		cors({
			origin: true,
			credentials: true,
			methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
			allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
			exposeHeaders: ["Set-Cookie"],
			preflight: true,
		}),
	)
	.state("state", state)
	// Auth
	.group("/auth", (app) =>
		app
			.get("/nonce", async () => {
				return await getNonceHandler();
			})
			.post("/verify", async ({ store: { state }, body, cookie: { token } }) => {
				return await verifySignatureHandler({
					store: { state },
					body,
					cookie: { token },
				});
			})
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
			)
			.post("/sign_out", async ({ cookie: { token } }) => {
				return await signOutHandler({ cookie: { token } });
			}),
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
	.post("/chat/new",
		async ({store: {state}, body}) => {
			return await generateChatResponse({store: {state}, body});
		},
		{
			body: ChatRequest
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
			.get("/all", async ({ store: { state } }) => {
				return await getAllProjectsHandler({ store: { state } });
			})
			.get(
				"/:project_id",
				async ({ store: { state }, params: {project_id} }) => {
					return await getProjectHandler({ store: { state }, params: {project_id} });
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
			.get(
				"/proposal/:proposal_id",
				async ({ store, params: { proposal_id } }) => {
					return await getProjectProposalHandler({
						store,
						params: { proposal_id },
					});
				}, {
					params: t.Object({
						proposal_id: t.String()
					})
				}
			)
			.post(
				"/:project_id/proposal/:proposal_id/phase/register",
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
			)
			.post(
				"/:project_id/proposal/:proposal_id/phase/accept",
				async ({
					store,
					cookie: { token },
					params: { project_id, proposal_id },
					body,
				}) => {
					return await acceptProjectPhaseHandler({
						store,
						cookie: { token },
						params: { project_id, proposal_id },
						body,
					});
				},
			),
	)
	.group("/agency", (app) =>
		app
			.get(
				"/:agency_id/proposals",
				async ({ store, params: { agency_id } }) => {
					return await getAgencyProjectProposalsHandler({
						store,
						params: { agency_id },
					});
				},
				{
					params: t.Object({
						agency_id: t.String(),
					}),
				},
			)
			.get("/:agency_id", async ({ store, params: { agency_id } }) => {
				return await getAgencyData({
					store,
					params: { agency_id },
				});
			}),
	)
	.listen(8000);

console.log(
	`Elysia is running at http://${app.server?.hostname}:${app.server?.port}`,
);

export type App = typeof app;

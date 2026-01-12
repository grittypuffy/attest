import type { InferenceClient } from "@huggingface/inference";
import type { Collection, Db } from "mongodb";

export default interface AppState {
	db: Db;
	userCollection: Collection;
	projectCollection: Collection;
	proposalCollection: Collection;
	phaseCollection: Collection;
	jwtSecret: string;
	inferenceClient: InferenceClient;
}

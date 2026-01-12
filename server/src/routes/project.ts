import type { Context } from "elysia";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { SignUpRequest } from "../models/auth";
import { CreateProjectRequest } from "../models/project";
import { Collection } from "mongodb";

export const createProjectHandler = async ({
	store,
	body,
	cookie: { token },
}: any) => {
	try {
		const decoded = jwt.verify(token.value, store.state.jwtSecret) as {
			id: string;
			email: string;
			role: string;
		};
        if (decoded.role !== "Government") return {error: "Not found", data: null, success: false, message: "Not found"}
		const projectData = body as typeof CreateProjectRequest;
		const projectCollection: Collection = store.state.projectCollection;

		const _result = await projectCollection.insertOne({
			project_name: projectData.project_name,
            description: projectData.description
		});

		return {
			success: true,
			data: {
                project_name: projectData.name,
                project_id: _result.insertedId.toString(),
                description: projectData.description
            },
			error: null,
			message: "Agency created successfully",
		};
	} catch (_e) {
		return { error: "Invalid or expired token", message: "Unauthorized", data: null, success: false };
	}
};

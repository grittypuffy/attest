import type { Context } from "elysia";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { SignUpRequest } from "../models/auth";

export const createAgencyHandler = async ({
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
		if (decoded.role !== "Government")
			return {
				error: "Not found",
				data: null,
				success: false,
				message: "Not found",
			};
		const signUpData = body as typeof SignUpRequest;
		const userCollection = store.state.userCollection;

		const existingUser = await userCollection.findOne({
			email: signUpData.email,
		});
		if (existingUser)
			return {
				error: "Agency already exists",
				success: false,
				message: "Failed to create agency",
				data: null,
			};

		const salt = await bcrypt.genSalt(10);
		const passwordHash = await bcrypt.hash(signUpData.password, salt);

		const _result = await userCollection.insertOne({
			email: signUpData.email,
			password: passwordHash,
			name: signUpData.name,
			address: signUpData.address,
			role: "Agency",
		});

		return {
			success: true,
			data: null,
			error: null,
			message: "Agency created successfully",
		};
	} catch (_e) {
		return { error: "Invalid or expired token" };
	}
};

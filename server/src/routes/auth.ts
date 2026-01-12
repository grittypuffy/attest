import type { Context } from "elysia";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { SignUpRequest } from "../models/auth";
import { Collection, ObjectId } from "mongodb";

export const signInHandler = async ({
	store,
	body,
	cookie: { token },
	set,
}: any) => {
	const { email, password } = body;

	const database = store.state.db;
	const userCollection = database.collection("user");

	const user = await userCollection.findOne({ email });
	if (!user) return { error: "Invalid username or password" };
	const isPasswordValid = await bcrypt.compare(password, user.password);
	if (!isPasswordValid)
		return {
			error: "Invalid username or password",
			data: null,
			message: "User already exists",
			success: false,
		};

	const jwtToken = jwt.sign(
		{ id: user._id.toString(), email: user.email, role: user.role },
		store.state.jwtSecret,
		{ expiresIn: "1h" },
	);
	token.value = jwtToken;
	token.httpOnly = true;
	token.path = "/";
	set.cookie = {
		...set.cookie,
		token: {
			value: jwtToken,
			secure: process.env.NODE_ENV === "production",
			maxAge: 60 * 60 * 24 * 7,
			httpOnly: true,
			path: "/",
			sameSite: "lax",
		},
	};

	return {
		success: true,
		data: { role: user.role, email: user.email, name: user.name },
		error: null,
		message: "Signed in successfully",
	};
};

export const getAuthUserHandler = async ({ store, cookie: { token } }: any) => {
	const userCollection: Collection = store.state.userCollection;
	try {
		const decoded = jwt.verify(token.value, store.state.jwtSecret) as {
			id: string;
			email: string;
			role: string;
		};
		const existingUser = await userCollection.findOne({
			email: decoded.email,
		});
		if (!existingUser)
			return {
				error: "No user found",
				data: null,
				success: false,
				message: "Failed to get user data",
			};
		return {
			success: true,
			data: {
				id: existingUser._id.toString(),
				email: existingUser.email,
				role: existingUser.role,
				name: existingUser.name,
				address: existingUser.address,
			},
			error: null,
			message: "User retrieved successfully",
		};
	} catch (_e) {
		return {
			error: "Invalid or expired token",
			data: null,
			message: "Invalid session",
			success: false,
		};
	}
};

export const getUserHandler = async ({ store, params: { user_id } }: any) => {
	const userCollection: Collection = store.state.userCollection;
	const existingUser = await userCollection.findOne({
		_id: new ObjectId(user_id),
	});
	if (!existingUser)
		return {
			error: "No user found",
			data: null,
			success: false,
			message: "Failed to get user data",
		};
	return {
		success: true,
		data: {
			id: existingUser._id.toString(),
			email: existingUser.email,
			role: existingUser.role,
			name: existingUser.name,
			address: existingUser.address,
		},
		error: null,
		message: "User retrived successfully",
	};
};

export const verifySessionHandler = async ({
	store,
	cookie: { token },
}: any) => {
	const userCollection: Collection = store.state.userCollection;
	try {
		const decoded = jwt.verify(token.value, store.state.jwtSecret) as {
			id: string;
			email: string;
			role: string;
		};
		const existingUser = await userCollection.findOne({
			email: decoded.email,
		});
		if (!existingUser)
			return {
				error: "No user found",
				data: {
					valid: false,
				},
				success: false,
				message: "Failed to get user data",
			};
		return {
			success: true,
			data: {
				valid: true,
			},
			error: null,
			message: "Session validated successfully",
		};
	} catch (_e) {
		return {
			error: "Invalid or expired token",
			data: { valid: false },
			message: "Invalid session",
			success: false,
		};
	}
};

export const signOutHandler = async ({ cookie: { token } }: any) => {
	token.remove();
	return {
		success: true,
		data: null,
		error: null,
		message: "Signed out successfully",
	};
};

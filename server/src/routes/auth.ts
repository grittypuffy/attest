import type { Context } from "elysia";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { SignUpRequest } from "../models/auth";
import { Collection, ObjectId } from "mongodb";
import { verifyMessage } from "viem";

export const getNonceHandler = async () => {
	return {
		success: true,
		data: {
			nonce: Math.random().toString(36).substring(2, 15),
		},
		error: null,
		message: "Nonce generated successfully",
	};
};

export const verifySignatureHandler = async ({
	store,
	body,
	cookie: { token },
}: any) => {
	const { address, signature, nonce } = body;

	const message = `Sign in to Attest with your wallet. Nonce: ${nonce}`;

	const isValid = await verifyMessage({
		address,
		message,
		signature,
	});

	if (!isValid) {
		return {
			success: false,
			error: "Invalid signature",
			data: null,
			message: "Verification failed",
		};
	}

	const database = store.state.db;
	const userCollection = database.collection("user");

	let user = await userCollection.findOne({ walletAddress: address.toLowerCase() });
	
	if (!user) {
		// If user doesn't exist, we might want to create a default "Agency" or just fail
		// For now, let's create a default Agency if not found, or maybe just fail if it's supposed to be restricted
		// User said "agency can be created by the government", so let's fail if not found.
		return {
			success: false,
			error: "User not registered",
			data: null,
			message: "This wallet address is not registered in the system.",
		};
	}

	const jwtToken = jwt.sign(
		{ id: user._id.toString(), email: user.email, role: user.role, address: address.toLowerCase() },
		store.state.jwtSecret,
		{ expiresIn: "1h" },
	);
	token.value = jwtToken;
	token.httpOnly = true;
	token.path = "/";
	token.set({
		secure: process.env.NODE_ENV === "production",
		maxAge: 60 * 60 * 24 * 7,
	});

	return {
		success: true,
		data: { role: user.role, email: user.email, name: user.name, address: user.walletAddress },
		error: null,
		message: "Signed in successfully",
	};
};

export const signInHandler = async ({
	store,
	body,
	cookie: { token },
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
	token.set({
		secure: process.env.NODE_ENV === "production",
		maxAge: 60 * 60 * 24 * 7,
	});

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

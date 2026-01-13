import type { Context } from "elysia";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { SignUpRequest } from "../models/auth";
import { Collection, ObjectId } from "mongodb";
import { verifyMessage } from "viem";

export const requestNonceHandler = async ({ body }: any) => {
	const { address } = body;
	const nonce = Math.floor(Math.random() * 1000000).toString();
	// In a production app, you should store this nonce in Redis or DB associated with the address
	// For this hackathon, we'll return it and expect it back in the signature
	return {
		success: true,
		data: { nonce },
		message: "Nonce generated",
	};
};

export const verifySignatureHandler = async ({
	store,
	body,
	cookie: { token },
	set,
}: any) => {
	const { address, signature, nonce } = body;

	const message = `Sign this message to verify your identity: ${nonce}`;

	const isValid = await verifyMessage({
		address,
		message,
		signature,
	});

	if (!isValid) {
		return { error: "Invalid signature", success: false };
	}

	const database = store.state.db;
	const userCollection = database.collection("user");

	// Find user by wallet address
	let user = await userCollection.findOne({ walletAddress: address.toLowerCase() });
	
	// If not found, try finding by physical address field if it was used as wallet address
	if (!user) {
		user = await userCollection.findOne({ address: address });
	}

	if (!user) {
		return { error: "User not registered with this wallet", success: false };
	}

	const jwtToken = jwt.sign(
		{ id: user._id.toString(), email: user.email, role: user.role },
		store.state.jwtSecret,
		{ expiresIn: "7d" },
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
		{ expiresIn: "7d" },
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
		if (!token.value) throw new Error("No token");
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
				walletAddress: existingUser.walletAddress,
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
			walletAddress: existingUser.walletAddress,
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
		if (!token.value) throw new Error("No token");
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
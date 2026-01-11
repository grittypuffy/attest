import type { Context } from "elysia";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { SignUpRequest } from "../models/auth";

export const signUpHandler = async ({ store, body }: any) => {
  const signUpData = body as typeof SignUpRequest;
  const userCollection = store.state.userCollection;

  const existingUser = await userCollection.findOne({
    email: signUpData.email,
  });
  if (existingUser) return { error: "User already exists", "data": null, "message": "User already exists", "success": false };

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
    message: "Signed up successfully",
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
  if (!isPasswordValid) return { error: "Invalid username or password", "data": null, "message": "User already exists", "success": false };

  const jwtToken = jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    store.state.jwtSecret,
    { expiresIn: "1h" }
  );
  token.value = jwtToken;
  token.httpOnly = true;
  token.path = "/";
  token.set({
    sameSite: "lax",
    secure: true,
    maxAge: 60 * 60 * 24 * 7,
  });

  return {
    success: true,
    data: { role: user.role, email: user.email, name: user.name },
    error: null,
    message: "Signed in successfully",
  };
};

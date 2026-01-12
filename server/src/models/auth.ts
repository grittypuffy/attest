import { t } from "elysia";

export const SignUpRequest = t.Object({
	email: t.String(),
	password: t.Optional(t.String()),
	name: t.String(),
	address: t.String(),
	walletAddress: t.String(),
});

export const SignInRequest = t.Object({
	email: t.String(),
	password: t.String(),
});

import { Elysia } from "elysia";
import { auth } from "../auth/config";

export const betterAuth = new Elysia({ name: "better-auth" }).macro({
	auth: {
		async resolve({ status, request: { headers } }) {
			const session = await auth.api.getSession({
				headers,
			});

			if (!session) return status(401);

			return {
				user: session.user,
				session: session.session,
			};
		},
	},
});

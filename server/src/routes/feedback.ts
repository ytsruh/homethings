import { Elysia } from "elysia";
import { betterAuth } from "~/middleware/auth";
import { CreateFeedbackRequestSchema } from "~/schemas";
import { database } from "../db";
import { feedback } from "../db/schema";

const feedbackRoutes = new Elysia({
	name: "feedback",
	prefix: "",
})
	.use(betterAuth)
	.post(
		"/feedback",
		async ({ user, body }) => {
			const validated = CreateFeedbackRequestSchema.parse(body);
			const now = new Date();
			const feedbackId = crypto.randomUUID();

			await database.insert(feedback).values({
				id: feedbackId,
				title: validated.title,
				body: validated.body,
				createdBy: user.id,
				createdAt: now,
			});

			return { message: "Feedback submitted" };
		},
		{
			body: CreateFeedbackRequestSchema,
			auth: true,
			detail: {
				tags: ["Feedback"],
				description: "Submit feedback",
			},
		},
	);

export default feedbackRoutes;

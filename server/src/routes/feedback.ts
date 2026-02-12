import { Hono } from "hono";
import { database } from "~/db";
import { feedback } from "~/db/schema";
import type { JWTPayload } from "~/middleware/jwt";
import { createValidator } from "~/middleware/validator";
import { CreateFeedbackRequestSchema } from "~/schemas";

const feedbackRoutes = new Hono<{ Variables: { user: JWTPayload } }>();

feedbackRoutes.post(
	"/feedback",
	createValidator(CreateFeedbackRequestSchema),
	async (c) => {
		const user = c.get("user");
		const body = c.req.valid("json");
		const now = new Date();
		const feedbackId = crypto.randomUUID();

		await database.insert(feedback).values({
			id: feedbackId,
			title: body.title,
			body: body.body,
			createdBy: user.userId,
			createdAt: now,
		});

		return c.json({ message: "Feedback submitted" });
	},
);

export default feedbackRoutes;

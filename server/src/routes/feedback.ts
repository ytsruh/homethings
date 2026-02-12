import { Hono } from "hono";
import { database } from "~/db";
import { feedback } from "~/db/schema";
import type { JWTPayload } from "~/middleware/jwt";
import { CreateFeedbackRequestSchema } from "~/schemas";

const feedbackRoutes = new Hono<{ Variables: { user: JWTPayload } }>();

feedbackRoutes.post("/feedback", async (c) => {
	const user = c.get("user");
	const body = await c.req.json();

	const validated = CreateFeedbackRequestSchema.parse(body);
	const now = new Date();
	const feedbackId = crypto.randomUUID();

	await database.insert(feedback).values({
		id: feedbackId,
		title: validated.title,
		body: validated.body,
		createdBy: user.userId,
		createdAt: now,
	});

	return c.json({ message: "Feedback submitted" });
});

export default feedbackRoutes;

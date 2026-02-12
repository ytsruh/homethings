import { Scalar } from "@scalar/hono-api-reference";
import { Hono } from "hono";
import attachmentsRoutes from "./attachments";
import { chat as chatRoutes } from "./chat";
import commentsRoutes from "./comments";
import feedbackRoutes from "./feedback";
import notesRoutes from "./notes";

export const routes = new Hono()
	.route("/", notesRoutes)
	.route("/", attachmentsRoutes)
	.route("/", chatRoutes)
	.route("/", commentsRoutes)
	.route("/", feedbackRoutes);

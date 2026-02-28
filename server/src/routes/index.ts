import { Hono } from "hono";
import { chat as chatRoutes } from "./chat";
import commentsRoutes from "./comments";
import feedbackRoutes from "./feedback";
import { filesRoutes } from "./files";
import notesRoutes from "./notes";

export const routes = new Hono()
	.route("/", notesRoutes)
	.route("/", chatRoutes)
	.route("/", commentsRoutes)
	.route("/", feedbackRoutes)
	.route("/", filesRoutes);

import { Hono } from "hono";
import { chat as chatRoutes } from "./chat";
import commentsRoutes from "./comments";
import feedbackRoutes from "./feedback";
import { filesRoutes } from "./files";
import { images as imagesRoutes } from "./images";
import notesRoutes from "./notes";
import { recipesRoutes } from "./recipes";

export const routes = new Hono()
	.route("/", chatRoutes)
	.route("/", imagesRoutes)
	.route("/", notesRoutes)
	.route("/", commentsRoutes)
	.route("/", feedbackRoutes)
	.route("/", filesRoutes)
	.route("/", recipesRoutes);

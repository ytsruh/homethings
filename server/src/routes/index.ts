import attachmentsRoutes from "./attachments";
import { chat as chatRoutes } from "./chat";
import commentsRoutes from "./comments";
import feedbackRoutes from "./feedback";
import notesRoutes from "./notes";

export const routes = {
	notes: notesRoutes,
	attachments: attachmentsRoutes,
	chat: chatRoutes,
	comments: commentsRoutes,
	feedback: feedbackRoutes,
};

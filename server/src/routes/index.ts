import attachmentsRoutes from "./attachments";
import commentsRoutes from "./comments";
import feedbackRoutes from "./feedback";
import notesRoutes from "./notes";

export const routes = {
	notes: notesRoutes,
	attachments: attachmentsRoutes,
	comments: commentsRoutes,
	feedback: feedbackRoutes,
};

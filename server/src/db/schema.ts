import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
	id: text("id").primaryKey(),
	email: text("email").notNull().unique(),
	name: text("name"),
	avatar: text("avatar"),
	showChat: integer("show_chat", { mode: "boolean" }).notNull().default(true),
	showNotes: integer("show_notes", { mode: "boolean" }).notNull().default(true),
	showTasks: integer("show_tasks", { mode: "boolean" }).notNull().default(true),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const notes = sqliteTable("notes", {
	id: text("id").primaryKey(),
	title: text("title").notNull(),
	body: text("body"),
	priority: text("priority", {
		mode: "text",
		enum: ["low", "medium", "high", "urgent"],
	})
		.notNull()
		.default("medium"),
	completed: integer("completed", { mode: "boolean" }).notNull().default(false),
	createdBy: text("created_by")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const noteAttachments = sqliteTable("note_attachments", {
	id: text("id").primaryKey(),
	noteId: text("note_id")
		.notNull()
		.references(() => notes.id, { onDelete: "cascade" }),
	fileKey: text("file_key").notNull(),
	fileName: text("file_name").notNull(),
	fileType: text("file_type").notNull(),
	fileSize: integer("file_size").notNull(),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const notesComments = sqliteTable("notes_comments", {
	id: text("id").primaryKey(),
	comment: text("comment").notNull(),
	noteId: text("note_id")
		.notNull()
		.references(() => notes.id, { onDelete: "cascade" }),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const feedback = sqliteTable("feedback", {
	id: text("id").primaryKey(),
	title: text("title").notNull(),
	body: text("body").notNull(),
	createdBy: text("created_by")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

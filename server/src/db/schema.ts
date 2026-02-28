import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
	id: text("id").primaryKey(),
	email: text("email").notNull().unique(),
	passwordHash: text("password_hash").notNull(),
	name: text("name").notNull(),
	createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
		() => new Date(),
	),
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
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date())
		.$onUpdate(() => new Date()),
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

export const files = sqliteTable("files", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	fileKey: text("file_key").notNull(),
	fileName: text("file_name").notNull(),
	fileType: text("file_type").notNull(),
	fileSize: integer("file_size").notNull(),
	createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
		() => new Date(),
	),
});

export const usersRelations = relations(users, ({ many }) => ({
	notes: many(notes),
	feedback: many(feedback),
	files: many(files),
}));

export const notesRelations = relations(notes, ({ one, many }) => ({
	creator: one(users, {
		fields: [notes.createdBy],
		references: [users.id],
	}),
	comments: many(notesComments),
}));

export const notesCommentsRelations = relations(notesComments, ({ one }) => ({
	note: one(notes, {
		fields: [notesComments.noteId],
		references: [notes.id],
	}),
}));

export const feedbackRelations = relations(feedback, ({ one }) => ({
	user: one(users, {
		fields: [feedback.createdBy],
		references: [users.id],
	}),
}));

export const filesRelations = relations(files, ({ one }) => ({
	user: one(users, {
		fields: [files.userId],
		references: [users.id],
	}),
}));

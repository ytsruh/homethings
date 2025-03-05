import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";

export const accounts = sqliteTable("accounts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name"),
  createdAt: integer("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: integer("updated_at").$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

export type InsertAccount = typeof accounts.$inferInsert;
export type SelectAccount = typeof accounts.$inferSelect;

export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").default("User Name"),
  email: text("email").notNull(),
  password: text("password").notNull(),
  profileImage: text("profile_image"),
  showBooks: integer("show_books", { mode: "boolean" }).default(true),
  showDocuments: integer("show_documents", { mode: "boolean" }).default(true),
  showChat: integer("show_chat", { mode: "boolean" }).default(true),
  showNotes: integer("show_notes", { mode: "boolean" }).default(true),
  showWealth: integer("show_wealth", { mode: "boolean" }).default(true),
  showTasks: integer("show_tasks", { mode: "boolean" }).default(true),
  accountId: text("account_id").references(() => accounts.id),
  createdAt: integer("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: integer("updated_at").$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

export type Session = typeof session.$inferSelect;

export const feedback = sqliteTable("feedback", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  title: text("title"),
  body: text("body"),
  userId: text("user_id").references(() => users.id),
  createdAt: integer("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: integer("updated_at").$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

export type InsertFeedback = typeof feedback.$inferInsert;
export type SelectFeedback = typeof feedback.$inferSelect;

export const books = sqliteTable("books", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name"),
  isbn: text("isbn"),
  author: text("author"),
  genre: text("genre"),
  rating: integer("rating"),
  image: text("image"),
  read: integer("read", { mode: "boolean" }).default(false),
  wishlist: integer("wishlist", { mode: "boolean" }).default(false),
  userId: text("user_id").references(() => users.id),
  createdAt: integer("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: integer("updated_at").$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

export type InsertBook = typeof books.$inferInsert;
export type SelectBook = typeof books.$inferSelect;

export const documents = sqliteTable("documents", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  title: text("title"),
  description: text("description"),
  accountId: text("account_id").references(() => accounts.id),
  fileName: text("file_name"),
  createdAt: integer("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: integer("updated_at").$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

export type InsertDocument = typeof documents.$inferInsert;
export type SelectDocument = typeof documents.$inferSelect;

export const notes = sqliteTable("notes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  title: text("title"),
  body: text("body"),
  userId: text("user_id").references(() => users.id),
  createdAt: integer("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: integer("updated_at").$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

export type InsertNote = typeof notes.$inferInsert;
export type SelectNote = typeof notes.$inferSelect;

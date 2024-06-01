import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { generateIdFromEntropySize } from "lucia";

export const userTable = sqliteTable("user", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => generateIdFromEntropySize(10)),
  email: text("email").unique().notNull(),
  name: text("name").notNull(),
  accountId: text("account_id").notNull(),
  profileImage: text("profile_image"),
  password: text("password").notNull(),
  showDocuments: integer("show_documents", { mode: "boolean" }).notNull().default(false),
  showBooks: integer("show_books", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

export type InsertUser = typeof userTable.$inferInsert;
export type SelectUser = typeof userTable.$inferSelect;

export const sessionTable = sqliteTable("session", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  expiresAt: integer("expires_at").notNull(),
});

export type InsertSession = typeof sessionTable.$inferInsert;
export type SelectSession = typeof sessionTable.$inferSelect;

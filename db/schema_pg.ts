import { pgTable, unique, uuid, text, timestamp, boolean, bigint } from "drizzle-orm/pg-core";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
export const db = drizzle(pool);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    name: text("name").default("User Name"),
    email: text("email"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
    profileImage: text("profile_image"),
    showBooks: boolean("show_books").default(true),
    showDocuments: boolean("show_documents").default(true),
    accountId: uuid("account_id").references(() => accounts.id),
    isAdmin: boolean("is_admin").default(false),
  },
  (table) => {
    return {
      usersEmailKey: unique("users_email_key").on(table.email),
    };
  }
);
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export const feedback = pgTable("feedback", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  title: text("title"),
  body: text("body"),
  userId: uuid("user_id").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow(),
});
export type Feedback = InferSelectModel<typeof feedback>;
export type NewFeedback = InferInsertModel<typeof feedback>;

export const books = pgTable("books", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  name: text("name"),
  isbn: text("isbn"),
  author: text("author"),
  genre: text("genre"),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  rating: bigint("rating", { mode: "number" }),
  image: text("image"),
  read: boolean("read").default(false),
  wishlist: boolean("wishlist").default(false),
  userId: uuid("user_id")
    .references(() => users.id)
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow(),
});
export type Book = InferSelectModel<typeof books>;
export type NewBook = InferInsertModel<typeof books>;

export const accounts = pgTable("accounts", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  name: text("name"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
});
export type Account = InferSelectModel<typeof accounts>;
export type NewAccount = InferInsertModel<typeof accounts>;

export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  title: text("title"),
  description: text("description"),
  accountId: uuid("account_id")
    .references(() => accounts.id)
    .references(() => accounts.id),
  fileName: text("file_name"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow(),
});
export type Document = InferSelectModel<typeof documents>;
export type NewDocument = InferInsertModel<typeof documents>;

export const notes = pgTable("notes", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  title: text("title"),
  body: text("body"),
  userId: uuid("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
export type Note = InferSelectModel<typeof notes>;
export type NewNote = InferInsertModel<typeof notes>;

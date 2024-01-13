import {
  pgTable,
  pgEnum,
  pgSchema,
  AnyPgColumn,
  foreignKey,
  text,
  timestamp,
  integer,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { InferModel, sql } from "drizzle-orm";
import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

neonConfig.fetchConnectionCache = true;

const client = neon(process.env.DATABASE_URL);
export const db = drizzle(client);

export const account = pgTable("Account", {
  id: text("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  name: text("name"),
  createdAt: timestamp("createdAt", { precision: 3, mode: "string" }).defaultNow(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "string" }).defaultNow().notNull(),
});

export type Account = InferModel<typeof account, "select">;
export type NewAccount = InferModel<typeof account, "insert">;

export const user = pgTable(
  "User",
  {
    id: text("id")
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    name: text("name").default("User Name").notNull(),
    email: text("email").notNull(),
    password: text("password").notNull(),
    createdAt: timestamp("createdAt", { precision: 3, mode: "string" }).defaultNow(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "string" }).defaultNow().notNull(),
    accountId: text("accountId")
      .notNull()
      .references(() => account.id, { onDelete: "restrict", onUpdate: "cascade" }),
    profileImage: text("profileImage"),
    showBooks: boolean("showBooks").default(true).notNull(),
    showDocuments: boolean("showDocuments").default(true).notNull(),
  },
  (table) => {
    return {
      emailKey: uniqueIndex("User_email_key").on(table.email),
    };
  }
);
export type User = InferModel<typeof user, "select">;
export type NewUser = InferModel<typeof user, "insert">;

export const feedback = pgTable("Feedback", {
  id: text("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  title: text("title").notNull(),
  body: text("body"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "restrict", onUpdate: "cascade" }),
  createdAt: timestamp("createdAt", { precision: 3, mode: "string" }).defaultNow(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "string" }).defaultNow().notNull(),
});
export type Feedback = InferModel<typeof feedback, "select">;
export type NewFeedback = InferModel<typeof feedback, "insert">;

export const document = pgTable("Document", {
  id: text("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  accountId: text("accountId")
    .notNull()
    .references(() => account.id, { onDelete: "restrict", onUpdate: "cascade" }),
  createdAt: timestamp("createdAt", { precision: 3, mode: "string" }).defaultNow(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "string" }).defaultNow().notNull(),
  fileName: text("fileName").notNull(),
});
export type Document = InferModel<typeof document, "select">;
export type NewDocument = InferModel<typeof document, "insert">;

export const book = pgTable("Book", {
  id: text("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  name: text("name").notNull(),
  isbn: text("isbn").notNull(),
  author: text("author"),
  genre: text("genre"),
  rating: integer("rating"),
  image: text("image"),
  read: boolean("read").default(false).notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "restrict", onUpdate: "cascade" }),
  createdAt: timestamp("createdAt", { precision: 3, mode: "string" }).defaultNow(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "string" }).defaultNow().notNull(),
  wishlist: boolean("wishlist").default(false).notNull(),
});
export type Book = InferModel<typeof book, "select">;
export type NewBook = InferModel<typeof book, "insert">;

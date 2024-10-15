import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";

export const accountsTable = sqliteTable("accounts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name"),
  createdAt: integer("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: integer("updated_at").$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

export type InsertAccount = typeof accountsTable.$inferInsert;
export type SelectAccount = typeof accountsTable.$inferSelect;

export const usersTable = sqliteTable("users", {
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
  accountId: text("account_id").references(() => accountsTable.id),
  createdAt: integer("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: integer("updated_at").$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;

export const feedbackTable = sqliteTable("feedback", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  title: text("title"),
  body: text("body"),
  userId: text("user_id").references(() => usersTable.id),
  createdAt: integer("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: integer("updated_at").$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

export type InsertFeedback = typeof feedbackTable.$inferInsert;
export type SelectFeedback = typeof feedbackTable.$inferSelect;

export const booksTable = sqliteTable("books", {
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
  userId: text("user_id").references(() => usersTable.id),
  createdAt: integer("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: integer("updated_at").$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

export type InsertBook = typeof booksTable.$inferInsert;
export type SelectBook = typeof booksTable.$inferSelect;

export const documentsTable = sqliteTable("documents", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  title: text("title"),
  description: text("description"),
  accountId: text("account_id").references(() => accountsTable.id),
  fileName: text("file_name"),
  createdAt: integer("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: integer("updated_at").$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

export type InsertDocument = typeof documentsTable.$inferInsert;
export type SelectDocument = typeof documentsTable.$inferSelect;

export const notesTable = sqliteTable("notes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  title: text("title"),
  body: text("body"),
  userId: text("user_id").references(() => usersTable.id),
  createdAt: integer("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: integer("updated_at").$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

export type InsertNote = typeof notesTable.$inferInsert;
export type SelectNote = typeof notesTable.$inferSelect;

export const wealthItemsTable = sqliteTable("wealth_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  type: text("type", { enum: ["asset", "liability"] }).notNull(),
  notes: text("notes"),
  link: text("link"),
  open: integer("open", { mode: "boolean" }).default(true),
  accountId: text("account_id").references(() => accountsTable.id),
  createdAt: integer("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: integer("updated_at").$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

export type InsertWealthItem = typeof wealthItemsTable.$inferInsert;
export type SelectWealthItem = typeof wealthItemsTable.$inferSelect;

export const wealthValuesTable = sqliteTable(
  "wealth_values",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    wealthItemId: text("wealth_item_id")
      .notNull()
      .references(() => wealthItemsTable.id, { onDelete: "cascade" }),
    month: integer("month").notNull(),
    year: integer("year").notNull(),
    value: integer("value").notNull(),
    createdAt: integer("created_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updatedAt: integer("updated_at").$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => ({
    // Composite unique constraint enforcing unique value wealth item & month-year
    uniqueMonthYearPerParent: unique("unique_value_per_item").on(table.wealthItemId, table.month, table.year),
  })
);

export type InsertWealthValue = typeof wealthValuesTable.$inferInsert;
export type SelectWealthValue = typeof wealthValuesTable.$inferSelect;

/*
File to migrate data from old database to new database
The following can be deleted when finished:
- this file
- npm script to run this file aka 'migrate'
- pg node module
*/
import pg from "pg";
import { config } from "dotenv";
config({ path: ".env" });

const { Client } = pg;
const client = new Client({
  connectionString: process.env.OLD_DATABASE_URL,
});

import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(turso);

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

async function migrateAccounts() {
  await client.connect();
  const res = await client.query("SELECT * FROM accounts");
  await client.end();
  console.log(res.rows);
  await db.insert(accountsTable).values(
    res.rows.map((row) => {
      let created = new Date(row.created_at);
      let updated = new Date(row.updated_at);
      return {
        id: row.id,
        name: row.name,
        createdAt: created.getTime(),
        updatedAt: updated.getTime(),
      };
    }),
  );
}

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
  accountId: text("account_id").references(() => accountsTable.id),
  createdAt: integer("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: integer("updated_at").$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

async function migrateUsers() {
  await client.connect();
  const res = await client.query("SELECT * FROM users");
  await client.end();
  console.log(res.rows);
  await db.insert(usersTable).values(
    res.rows.map((row) => {
      let created = new Date(row.created_at);
      let updated = new Date(row.updated_at);
      return {
        id: row.id,
        name: row.name,
        email: row.email,
        password: row.password,
        profileImage: row.profile_image,
        showBooks: row.show_books,
        showDocuments: row.show_documents,
        accountId: row.account_id,
        createdAt: created.getTime(),
        updatedAt: updated.getTime(),
      };
    }),
  );
}

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

async function migrateBooks() {
  await client.connect();
  const res = await client.query("SELECT * FROM books");
  await client.end();
  console.log(res.rows);
  await db.insert(booksTable).values(
    res.rows.map((row) => {
      let created = new Date(row.created_at);
      let updated = new Date(row.updated_at);
      return {
        id: row.id,
        name: row.name,
        isbn: row.isbn,
        author: row.author,
        genre: row.genre,
        rating: row.rating,
        image: row.image,
        read: row.read,
        wishlist: row.wishlist,
        userId: row.user_id,
        createdAt: created.getTime(),
        updatedAt: updated.getTime(),
      };
    }),
  );
}

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

async function migrateDocs() {
  await client.connect();
  const res = await client.query("SELECT * FROM documents");
  await client.end();
  console.log(res.rows);
  await db.insert(documentsTable).values(
    res.rows.map((row) => {
      let created = new Date(row.created_at);
      let updated = new Date(row.updated_at);
      return {
        id: row.id,
        title: row.title,
        description: row.description,
        accountId: row.account_id,
        fileName: row.file_name,
        createdAt: created.getTime(),
        updatedAt: updated.getTime(),
      };
    }),
  );
}

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

async function migrateNotes() {
  await client.connect();
  const res = await client.query("SELECT * FROM notes");
  await client.end();
  console.log(res.rows);
  await db.insert(notesTable).values(
    res.rows.map((row) => {
      let created = new Date(row.created_at);
      let updated = new Date(row.updated_at);
      return {
        id: row.id,
        title: row.title,
        body: row.body,
        userId: row.user_id,
        createdAt: created.getTime(),
        updatedAt: updated.getTime(),
      };
    }),
  );
}

//await migrateAccounts();
//await migrateUsers();
//await migrateBooks();
//await migrateDocs();
//await migrateNotes();

import { Hono } from "hono";
import { createDBClient } from "../db";
import { wealthItemsTable, wealthValuesTable } from "../db/schema";
import type { InsertWealthItem, SelectWealthItem, InsertWealthValue, SelectWealthValue } from "../db/schema";
import { and, eq } from "drizzle-orm";
import type { UserToken, GlobalVariables, GlobalBindings } from "../types";
import { dateToYearMonth } from "@/lib/utils";

const app = new Hono<{ Bindings: GlobalBindings; Variables: GlobalVariables }>();

app.get("/", async (c) => {
  try {
    const storedUser = c.get("user");
    const user: UserToken = JSON.parse(storedUser);
    const db = await createDBClient(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);

    const monthYear = dateToYearMonth(new Date());
    const rows = await db
      .select()
      .from(wealthItemsTable)
      .where(eq(wealthItemsTable.accountId, user.accountId))
      .leftJoin(wealthValuesTable, eq(wealthValuesTable.year, monthYear.year));

    // Format data to an array of objects with item and values properties
    const data = rows.reduce<Record<string, { item: SelectWealthItem; values: SelectWealthValue[] }>>(
      (acc, row) => {
        const item = row.wealth_items;
        const value = row.wealth_values;
        if (!acc[item.id]) {
          acc[item.id] = { item, values: [] };
        }
        if (value) {
          acc[item.id].values.push(value);
        }
        return acc;
      },
      {}
    );

    return c.json({ message: "success", data: Object.values(data) });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Something went wrong" }, { status: 500 });
  }
});

app.get("/list", async (c) => {
  try {
    console.log("list");

    const storedUser = c.get("user");
    const user: UserToken = JSON.parse(storedUser);
    const db = await createDBClient(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);
    const data = await db
      .select()
      .from(wealthItemsTable)
      .where(eq(wealthItemsTable.accountId, user.accountId));

    return c.json({ message: "success", data: data });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Something went wrong" }, { status: 500 });
  }
});

app.get("/:id", async (c) => {
  try {
    const storedUser = c.get("user");
    const user: UserToken = JSON.parse(storedUser);
    const db = await createDBClient(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);

    const rows = await db
      .select()
      .from(wealthItemsTable)
      .where(and(eq(wealthItemsTable.accountId, user.accountId), eq(wealthItemsTable.id, c.req.param("id"))));

    return c.json({ message: "success", data: rows[0] });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Something went wrong" }, { status: 500 });
  }
});

// Query children for a specific parent and month-year
// const startDate = new Date("2023-01-01");
// const endDate = new Date("2023-12-31");
// const queryResult = await db
//   .select()
//   .from(childTable)
//   .where(
//     and(
//       eq(childTable.parentId, 1),
//       between(childTable.year, startDate.getFullYear(), endDate.getFullYear()),
//       or(
//         and(eq(childTable.year, startDate.getFullYear()), gte(childTable.month, startDate.getMonth() + 1)),
//         and(eq(childTable.year, endDate.getFullYear()), lte(childTable.month, endDate.getMonth() + 1)),
//         between(childTable.year, startDate.getFullYear() + 1, endDate.getFullYear() - 1)
//       )
//     )
//   );

app.post("/", async (c) => {
  try {
    const storedUser = c.get("user");
    const user: UserToken = JSON.parse(storedUser);
    const db = await createDBClient(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);

    const body = await c.req.json();
    if (body.type !== "asset" && body.type !== "liability") {
      throw new Error("type of wealth item is not set. Must be 'asset' or 'liability'");
    }
    const newWealthItem: InsertWealthItem = {
      name: body.name,
      type: body.type,
      notes: body.notes,
      accountId: user.accountId,
    };
    const data = await db.insert(wealthItemsTable).values(newWealthItem);
    return c.json({ message: "success", data: data });
  } catch (error) {
    // For errors, log to console and send a 500 response back
    console.log(error);
    return c.json({ error: "Something went wrong" }, { status: 500 });
  }
});

app.patch("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const storedUser = c.get("user");
    const user: UserToken = JSON.parse(storedUser);
    const db = await createDBClient(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);

    const body = await c.req.json();
    if (body.type !== "asset" || body.type !== "liability") {
      throw new Error("type of wealth item is not set. Must be 'asset' or 'liability'");
    }
    const data = await db
      .update(wealthItemsTable)
      .set({ name: body.title, type: body.type, notes: body.notes, open: body.open || true })
      .where(and(eq(wealthItemsTable.id, id), eq(wealthItemsTable.accountId, user.accountId)));

    return c.json({ message: "success", data: data });
  } catch (error) {
    // For errors, log to console and send a 500 response back
    console.log(error);
    return c.json({ error: "Something went wrong" }, { status: 500 });
  }
});

app.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const storedUser = c.get("user");
    const user: UserToken = JSON.parse(storedUser);
    const db = await createDBClient(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);

    const results = await db
      .delete(wealthItemsTable)
      .where(and(eq(wealthItemsTable.id, id), eq(wealthItemsTable.accountId, user.accountId)));

    if (results.rowsAffected === 0) {
      return c.json({ error: "Note not found" }, { status: 404 });
    }

    return c.json({ deleted: "success" });
  } catch (error) {
    // For errors, log to console and send a 500 response back
    console.log(error);
    return c.json({ error: "Something went wrong" }, { status: 500 });
  }
});

app.get("/:id/values", async (c) => {
  try {
    const id = c.req.param("id");
    const storedUser = c.get("user");
    const user: UserToken = JSON.parse(storedUser);
    const db = await createDBClient(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);

    // Get rows from DB
    const rows = await db
      .select()
      .from(wealthItemsTable)
      .where(and(eq(wealthItemsTable.id, id), eq(wealthItemsTable.accountId, user.accountId)))
      .leftJoin(wealthValuesTable, eq(wealthValuesTable.wealthItemId, id));

    // Format data to an array of objects with item and values properties
    const data = rows.reduce<Record<string, { item: SelectWealthItem; values: SelectWealthValue[] }>>(
      (acc, row) => {
        const item = row.wealth_items;
        const value = row.wealth_values;
        if (!acc[item.id]) {
          acc[item.id] = { item, values: [] };
        }
        if (value) {
          acc[item.id].values.push(value);
        }
        return acc;
      },
      {}
    );

    return c.json({ message: "success", data: Object.values(data)[0] });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Something went wrong" }, { status: 500 });
  }
});

app.post("/:id/values", async (c) => {
  try {
    const id = c.req.param("id");
    const db = await createDBClient(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);

    const body = await c.req.json();
    if (!body.date) {
      throw new Error("date required but is missing");
    }
    console.log(body);

    const monthYear = dateToYearMonth(body.date);

    const newWealthValue: InsertWealthValue = {
      wealthItemId: id,
      month: monthYear.month,
      year: monthYear.year,
      value: body.value,
    };
    const data = await db.insert(wealthValuesTable).values(newWealthValue);
    return c.json({ message: "success", data: data });
  } catch (error) {
    // For errors, log to console and send a 500 response back
    console.log(error);
    return c.json({ error: "Something went wrong" }, { status: 500 });
  }
});

export default app;

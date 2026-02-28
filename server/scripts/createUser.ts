import { database } from "~/db";
import { users } from "~/db/schema";

const email = prompt("Email: ");
const name = prompt("Name: ");
const password = prompt("Password: ");

if (!email || !name || !password) {
  console.error("All fields are required");
  process.exit(1);
}

const passwordHash = await Bun.password.hash(password);
const id = crypto.randomUUID();

try {
  await database.insert(users).values({
    id,
    email,
    passwordHash,
    name,
    createdAt: new Date(),
  });
  console.log(`User created successfully: ${email} (${id})`);
} catch (error: any) {
  if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
    console.error("Error: Email already exists");
  } else {
    console.error("Error creating user:", error.message);
  }
  process.exit(1);
}

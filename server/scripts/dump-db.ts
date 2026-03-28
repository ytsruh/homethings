import { $ } from "bun";

try {
	// Remove old local database file
	await $`rm -f ./local.db ./local.db-wal ./local.db-shm`;
	// Dump the database to a SQL file
	await $`turso db shell homethings .dump > dump.sql`;
	// Load the SQL file into the local database
	await $`cat dump.sql | sqlite3 ./local.db`;
	// Clean up the SQL file
	await $`rm dump.sql`;
} catch (error) {
	console.error("Turso DB dump failed:", error);
}

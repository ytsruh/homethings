import type { Config } from 'drizzle-kit'

export default {
	schema: './src/db/schema.ts',
	dialect: 'sqlite',
	out: './drizzle',
	url: 'file:./local.db',
} satisfies Config
export type EnvVars = {
	NODE_ENV: string;
	PORT: string;
	JWT_SECRET: string;
	TURSO_DATABASE_URL: string;
	TURSO_AUTH_TOKEN: string;
	OPENROUTER_API_KEY: string;
	STORAGE_KEY: string;
	STORAGE_SECRET: string;
	STORAGE_REGION: string;
	STORAGE_ENDPOINT: string;
	STORAGE_BUCKET: string;
};

export const envVarCheck = () => {
	const requiredVars = [
		"NODE_ENV",
		"PORT",
		"JWT_SECRET",
		"TURSO_DATABASE_URL",
		"TURSO_AUTH_TOKEN",
		"OPENROUTER_API_KEY",
		"STORAGE_KEY",
		"STORAGE_SECRET",
		"STORAGE_ENDPOINT",
		"STORAGE_BUCKET",
	];

	const missing = requiredVars.filter((varName) => !process.env[varName]);

	if (missing.length > 0) {
		throw new Error(
			`Missing required environment variables: ${missing.join(", ")}`,
		);
	}
};

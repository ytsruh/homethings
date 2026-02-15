import { sign, verify } from "hono/jwt";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";

export interface JWTPayload {
	userId: string;
	email: string;
	[k: string]: unknown;
}

export async function signJWT(payload: JWTPayload): Promise<string> {
	return await sign(payload, JWT_SECRET);
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
	try {
		const decoded = await verify(token, JWT_SECRET, "HS256");
		return decoded as unknown as JWTPayload;
	} catch {
		return null;
	}
}

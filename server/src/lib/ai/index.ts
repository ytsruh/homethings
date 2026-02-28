export * from "./config";
export * from "./errors";
export * from "./types";

import { openrouterProvider } from "./openrouter";

export function createAIProvider() {
	return openrouterProvider;
}

export const ai = createAIProvider();

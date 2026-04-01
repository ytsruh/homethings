import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText, NoObjectGeneratedError, Output } from "ai";
import { z } from "zod/v4";

const openrouter = createOpenRouter({
	apiKey: process.env.OPENROUTER_API_KEY,
});

const EXTRACTION_MODEL = "google/gemini-3-flash-preview";

const ExtractedRecipeSchema = z.object({
	title: z.string().describe("The name of the recipe"),
	description: z
		.string()
		.optional()
		.describe("A brief description of the recipe"),
	tags: z
		.array(z.string())
		.describe(
			"Relevant tags for the recipe (e.g. 'breakfast', 'quick', 'vegetarian')",
		),
	ingredients: z
		.array(
			z.object({
				name: z.string().describe("Name of the ingredient"),
				amount: z
					.string()
					.optional()
					.describe("Amount or quantity of the ingredient"),
			}),
		)
		.describe("List of ingredients with their amounts"),
	steps: z
		.array(z.string())
		.describe("Ordered list of recipe preparation steps"),
});

export type ExtractedRecipe = z.infer<typeof ExtractedRecipeSchema>;

export async function extractRecipeFromImage(
	imageDataUri: string,
): Promise<ExtractedRecipe> {
	const apiKey = process.env.OPENROUTER_API_KEY;
	if (!apiKey) {
		throw new Error("OpenRouter API key not configured");
	}

	try {
		const result = await generateText({
			model: openrouter(EXTRACTION_MODEL) as any,
			maxOutputTokens: 4096,
			temperature: 0.3,
			messages: [
				{
					role: "user",
					content: [
						{
							type: "text",
							text: `You are a recipe extraction assistant. Analyze the provided image and extract all recipe information.
									Return a structured JSON response with the following fields:
									- title: The name of the recipe
									- description: A brief description (optional)
									- tags: Relevant tags for the recipe (e.g. 'breakfast', 'quick', 'vegetarian', 'dessert')
									- ingredients: List of ingredients with name and amount
									- steps: Ordered list of preparation steps

									IMPORTANT: Return ONLY valid JSON matching this schema. No markdown code blocks, no explanations, just the raw JSON object.`,
						},
						{
							type: "image",
							image: imageDataUri,
						},
					],
				},
			],
			output: Output.object({
				schema: ExtractedRecipeSchema,
			}),
		});

		if (!result.output) {
			throw new Error("No structured output returned from AI");
		}

		return result.output;
	} catch (error) {
		if (NoObjectGeneratedError.isInstance(error)) {
			console.error("AI failed to generate valid recipe:", error.text);
			throw new Error(
				`Failed to extract recipe: ${error.message || "AI could not generate valid recipe data"}`,
			);
		}
		throw error;
	}
}

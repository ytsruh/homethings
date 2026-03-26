import { z } from "zod/v4";

export const IngredientSchema = z.object({
	name: z.string().nullable(),
	amount: z.string().nullable(),
});

export const RecipeResponseSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string().nullable(),
	tags: z
		.union([z.string(), z.array(z.string())])
		.transform((v) => (Array.isArray(v) ? v : (JSON.parse(v) as string[]))),
	ingredients: z
		.union([z.string(), z.array(IngredientSchema)])
		.transform((v) =>
			Array.isArray(v)
				? v
				: (JSON.parse(v) as z.infer<typeof IngredientSchema>[]),
		),
	steps: z
		.union([z.string(), z.array(z.string())])
		.transform((v) => (Array.isArray(v) ? v : (JSON.parse(v) as string[]))),
	imageKey: z.string().nullable(),
	createdAt: z.string().transform((v) => v),
	updatedAt: z.string().transform((v) => v),
});

export type Recipe = z.infer<typeof RecipeResponseSchema>;
export type Ingredient = z.infer<typeof IngredientSchema>;

export const CreateRecipeRequestSchema = z.object({
	title: z.string().min(1),
	description: z.string().optional(),
	tags: z.array(z.string()).optional(),
	ingredients: z.array(IngredientSchema).optional(),
	steps: z.array(z.string()).optional(),
});

export const UpdateRecipeRequestSchema = CreateRecipeRequestSchema.partial();

export const CreateRecipeFormSchema = z.object({
	title: z.string().min(1),
	description: z.string().optional(),
	tags: z.string().optional(),
});

export async function uploadRecipeImage(
	recipeId: string,
	file: File,
): Promise<{ imageKey: string }> {
	const response = await fetch(
		`${import.meta.env.VITE_API_BASE_URL}/api/recipes/${recipeId}/upload-url`,
		{
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ fileType: file.type }),
		},
	);

	if (!response.ok) {
		throw new Error("Failed to get upload URL");
	}

	const { imageKey, presignedUrl } = (await response.json()) as {
		imageKey: string;
		presignedUrl: string;
	};

	const uploadRes = await fetch(presignedUrl, {
		method: "PUT",
		headers: { "Content-Type": file.type || "application/octet-stream" },
		body: file,
	});

	if (!uploadRes.ok) {
		throw new Error("Failed to upload image");
	}

	return { imageKey };
}

export async function removeRecipeImage(recipeId: string): Promise<void> {
	const response = await fetch(
		`${import.meta.env.VITE_API_BASE_URL}/api/recipes/${recipeId}`,
		{
			method: "PATCH",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ imageKey: null }),
		},
	);

	if (!response.ok) {
		throw new Error("Failed to remove image");
	}
}

import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { database } from "~/db";
import { recipes } from "~/db/schema";
import {
	type ExtractedRecipe,
	extractRecipeFromImage,
} from "~/lib/ai/recipe-extractor";
import {
	CreateRecipeRequestSchema,
	ExtractRecipeRequestSchema,
	ListRecipesQuerySchema,
	RecipeImageUploadRequestSchema,
	RecipePathSchema,
	UpdateRecipeRequestSchema,
} from "~/lib/schemas";
import {
	createPresignedUrl,
	deleteImg,
	getPresignedDownloadUrl,
} from "~/lib/storage";
import {
	throwBadRequest,
	throwNotFound,
	throwServerError,
} from "~/middleware/http-exception";
import { createParamValidator, createValidator } from "~/middleware/validator";

export const recipesRoutes = new Hono();

recipesRoutes.post(
	"/recipes/extract",
	createValidator(ExtractRecipeRequestSchema),
	async (c) => {
		const body = c.req.valid("json");

		if (!body.imageData || !body.imageData.startsWith("data:image/")) {
			throwBadRequest("Invalid image data. Expected base64 data URI.");
			return;
		}

		let extracted: ExtractedRecipe;
		try {
			extracted = await extractRecipeFromImage(body.imageData);
		} catch (error) {
			console.error("AI extraction failed:", error);
			throwBadRequest(
				error instanceof Error
					? error.message
					: "Failed to extract recipe from image",
			);
			return;
		}

		if (!extracted.title) {
			throwBadRequest("Could not extract recipe title from image");
			return;
		}

		const now = new Date();
		const recipeId = crypto.randomUUID();

		await database.insert(recipes).values({
			id: recipeId,
			title: extracted.title,
			description: extracted.description || null,
			tags: JSON.stringify(extracted.tags ?? []),
			ingredients: JSON.stringify(extracted.ingredients ?? []),
			steps: JSON.stringify(extracted.steps ?? []),
			createdAt: now,
			updatedAt: now,
		});

		const created = await database.query.recipes.findFirst({
			where: eq(recipes.id, recipeId),
		});

		if (!created) {
			throwServerError();
			return;
		}

		return c.json(created, 201);
	},
);

recipesRoutes.get(
	"/recipes",
	createValidator(ListRecipesQuerySchema, "query"),
	async (c) => {
		const query = c.req.valid("query");
		let allRecipes = await database.query.recipes.findMany();

		if (query.tag) {
			const tag = query.tag;
			allRecipes = allRecipes.filter((recipe) =>
				(recipe.tags ?? []).includes(tag),
			);
		}

		return c.json(allRecipes);
	},
);

recipesRoutes.get(
	"/recipes/:id",
	createParamValidator(RecipePathSchema),
	async (c) => {
		const params = c.req.valid("param");
		const recipe = await database.query.recipes.findFirst({
			where: eq(recipes.id, params.id),
		});

		if (!recipe) {
			throwNotFound("Recipe not found");
			return;
		}

		return c.json(recipe);
	},
);

recipesRoutes.post(
	"/recipes",
	createValidator(CreateRecipeRequestSchema),
	async (c) => {
		const body = c.req.valid("json");
		const now = new Date();
		const recipeId = crypto.randomUUID();

		await database.insert(recipes).values({
			id: recipeId,
			title: body.title,
			description: body.description || null,
			tags: JSON.stringify(body.tags ?? []),
			ingredients: JSON.stringify(body.ingredients ?? []),
			steps: JSON.stringify(body.steps ?? []),
			createdAt: now,
			updatedAt: now,
		});

		const created = await database.query.recipes.findFirst({
			where: eq(recipes.id, recipeId),
		});

		if (!created) {
			throwServerError();
			return;
		}

		return c.json(created, 201);
	},
);

recipesRoutes.patch(
	"/recipes/:id",
	createParamValidator(RecipePathSchema),
	createValidator(UpdateRecipeRequestSchema),
	async (c) => {
		const params = c.req.valid("param");
		const body = c.req.valid("json");

		const existing = await database.query.recipes.findFirst({
			where: eq(recipes.id, params.id),
		});

		if (!existing) {
			throwNotFound("Recipe not found");
			return;
		}

		if (body.imageKey === null && existing.imageKey) {
			await deleteImg(existing.imageKey);
		}

		const updateData: Record<string, unknown> = {
			updatedAt: new Date(),
		};

		if (body.title !== undefined) updateData.title = body.title;
		if (body.description !== undefined) updateData.description = body.description;
		if (body.tags !== undefined) updateData.tags = JSON.stringify(body.tags);
		if (body.ingredients !== undefined)
			updateData.ingredients = JSON.stringify(body.ingredients);
		if (body.steps !== undefined) updateData.steps = JSON.stringify(body.steps);
		if (body.imageKey !== undefined)
			updateData.imageKey = body.imageKey;

		await database
			.update(recipes)
			.set(updateData)
			.where(eq(recipes.id, params.id));

		const updated = await database.query.recipes.findFirst({
			where: eq(recipes.id, params.id),
		});

		if (!updated) {
			throwServerError();
			return;
		}

		return c.json(updated);
	},
);

recipesRoutes.delete(
	"/recipes/:id",
	createParamValidator(RecipePathSchema),
	async (c) => {
		const params = c.req.valid("param");

		const existing = await database.query.recipes.findFirst({
			where: eq(recipes.id, params.id),
		});

		if (!existing) {
			throwNotFound("Recipe not found");
			return;
		}

		if (existing.imageKey) {
			await deleteImg(existing.imageKey);
		}

		await database.delete(recipes).where(eq(recipes.id, params.id));

		return c.json({ message: "Recipe deleted" });
	},
);

recipesRoutes.post(
	"/recipes/:id/upload-url",
	createParamValidator(RecipePathSchema),
	createValidator(RecipeImageUploadRequestSchema),
	async (c) => {
		const params = c.req.valid("param");
		const body = c.req.valid("json");

		const existing = await database.query.recipes.findFirst({
			where: eq(recipes.id, params.id),
		});

		if (!existing) {
			throwNotFound("Recipe not found");
			return;
		}

		if (existing.imageKey) {
			await deleteImg(existing.imageKey);
		}

		const fileExt = body.fileType.split("/")[1];
		const imageKey = `recipes/${params.id}.${fileExt}`;
		const presignedUrl = createPresignedUrl(imageKey);

		return c.json({ imageKey, presignedUrl });
	},
);

recipesRoutes.get(
	"/recipes/:id/image-url",
	createParamValidator(RecipePathSchema),
	async (c) => {
		const params = c.req.valid("param");

		const recipe = await database.query.recipes.findFirst({
			where: eq(recipes.id, params.id),
		});

		if (!recipe || !recipe.imageKey) {
			throwNotFound("Recipe image not found");
			return;
		}

		const presignedUrl = getPresignedDownloadUrl(recipe.imageKey);
		return c.json({ presignedUrl });
	},
);

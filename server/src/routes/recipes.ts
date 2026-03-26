import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { database } from "~/db";
import { recipes } from "~/db/schema";
import {
	CreateRecipeRequestSchema,
	ListRecipesQuerySchema,
	RecipePathSchema,
	UpdateRecipeRequestSchema,
} from "~/lib/schemas";
import { throwNotFound, throwServerError } from "~/middleware/http-exception";
import { createParamValidator, createValidator } from "~/middleware/validator";

export const recipesRoutes = new Hono();

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
			tags: body.tags,
			ingredients: body.ingredients,
			steps: body.steps,
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

		await database
			.update(recipes)
			.set({
				...body,
				updatedAt: new Date(),
			})
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

		await database.delete(recipes).where(eq(recipes.id, params.id));

		return c.json({ message: "Recipe deleted" });
	},
);

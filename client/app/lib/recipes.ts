const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

function getApiUrl(endpoint: string): string {
	return `${API_BASE_URL}${endpoint}`;
}

async function handleResponse<T>(response: Response): Promise<T> {
	if (!response.ok) {
		const error = (await response.json().catch(() => ({
			error: "An unexpected error occurred",
		}))) as { error: string };
		throw new Error(error.error || "Request failed");
	}
	return response.json() as Promise<T>;
}

export interface Ingredient {
	name?: string;
	amount?: string;
}

export interface Recipe {
	id: string;
	title: string;
	description: string | null;
	tags: string[];
	ingredients: Ingredient[];
	steps: string[];
	createdAt: string;
	updatedAt: string;
}

export async function getRecipes(tag?: string): Promise<Recipe[]> {
	let url = getApiUrl("/api/recipes");
	if (tag) {
		url += `?tag=${encodeURIComponent(tag)}`;
	}

	const response = await fetch(url, {
		method: "GET",
		credentials: "include",
	});

	const recipes = await handleResponse<Recipe[]>(response);
	return recipes.map((recipe) => ({
		...recipe,
		createdAt: recipe.createdAt.toString(),
		updatedAt: recipe.updatedAt.toString(),
	}));
}

export async function getRecipe(id: string): Promise<Recipe | null> {
	try {
		const response = await fetch(getApiUrl(`/api/recipes/${id}`), {
			method: "GET",
			credentials: "include",
		});

		if (response.status === 404) {
			return null;
		}

		const recipe = await handleResponse<Recipe>(response);
		return {
			...recipe,
			createdAt: recipe.createdAt.toString(),
			updatedAt: recipe.updatedAt.toString(),
		};
	} catch {
		return null;
	}
}

export async function createRecipe(data: {
	title: string;
	description?: string;
	tags?: string[];
	ingredients?: Ingredient[];
	steps?: string[];
}): Promise<Recipe> {
	const response = await fetch(getApiUrl("/api/recipes"), {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	});

	const recipe = await handleResponse<Recipe>(response);
	return {
		...recipe,
		createdAt: recipe.createdAt.toString(),
		updatedAt: recipe.updatedAt.toString(),
	};
}

export async function updateRecipe(
	id: string,
	updates: Partial<{
		title: string;
		description: string;
		tags: string[];
		ingredients: Ingredient[];
		steps: string[];
	}>,
): Promise<Recipe> {
	const response = await fetch(getApiUrl(`/api/recipes/${id}`), {
		method: "PATCH",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(updates),
	});

	const recipe = await handleResponse<Recipe>(response);
	return {
		...recipe,
		createdAt: recipe.createdAt.toString(),
		updatedAt: recipe.updatedAt.toString(),
	};
}

export async function deleteRecipe(id: string): Promise<{ message: string }> {
	const response = await fetch(getApiUrl(`/api/recipes/${id}`), {
		method: "DELETE",
		credentials: "include",
	});

	return handleResponse<{ message: string }>(response);
}

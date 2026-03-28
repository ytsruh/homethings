import { useId, useRef, useState } from "react";
import {
	Form,
	Link,
	redirect,
	useLoaderData,
	useNavigation,
} from "react-router";
import { toast } from "~/components/Toaster";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import { RecipeResponseSchema } from "~/lib/schemas/recipes";
import type { Route } from "./+types/edit";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
	const { recipeId } = params;

	const recipeRes = await fetch(
		`${import.meta.env.VITE_API_BASE_URL}/api/recipes/${recipeId}`,
		{ credentials: "include" },
	);

	if (!recipeRes.ok) {
		throw redirect("/app/recipes");
	}

	const recipeData = await recipeRes.json();
	const recipe = RecipeResponseSchema.parse(recipeData);

	return { recipe };
}

export async function clientAction({
	request,
	params,
}: Route.ClientActionArgs) {
	const { recipeId } = params;
	const formData = await request.formData();

	const title = (formData.get("title") as string | null) ?? "";
	const description = (formData.get("description") as string | null) ?? "";
	const tagsRaw = (formData.get("tags") as string | null) ?? "";
	const tags = tagsRaw
		? tagsRaw
				.split(",")
				.map((t) => t.trim())
				.filter(Boolean)
		: [];

	const ingredients: { name: string | null; amount: string | null }[] = [];
	const steps: string[] = [];

	let i = 0;
	while (formData.has(`ingredient-name-${i}`)) {
		ingredients.push({
			name: (formData.get(`ingredient-name-${i}`) as string | null) ?? null,
			amount: (formData.get(`ingredient-amount-${i}`) as string | null) ?? null,
		});
		i++;
	}

	let s = 0;
	while (formData.has(`step-${s}`)) {
		const step = (formData.get(`step-${s}`) as string | null) ?? "";
		if (step.trim()) steps.push(step);
		s++;
	}

	try {
		const response = await fetch(
			`${import.meta.env.VITE_API_BASE_URL}/api/recipes/${recipeId}`,
			{
				method: "PATCH",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ title, description, tags, ingredients, steps }),
			},
		);

		if (!response.ok) {
			const error = await response.json().catch(() => ({}));
			throw new Error(error.error || "Failed to update recipe");
		}

		toast({ title: "Success", description: "Recipe updated" });
		return redirect(`/app/recipes/${recipeId}`);
	} catch (error) {
		console.error("Failed to update recipe:", error);
		toast({
			title: "Error",
			description:
				error instanceof Error ? error.message : "Failed to update recipe",
			type: "destructive",
		});
		return { ok: false };
	}
}

type Ingredient = { name: string | null; amount: string | null; key: number };
type Step = { text: string; key: number };

export default function RecipeEditPage() {
	const { recipe } = useLoaderData<typeof clientLoader>();
	const navigation = useNavigation();
	const isSubmitting = navigation.state === "submitting";
	const id = useId();
	const ingredientKeyRef = useRef(recipe.ingredients.length);
	const stepKeyRef = useRef(recipe.steps.length);

	const [ingredients, setIngredients] = useState<Ingredient[]>(
		recipe.ingredients.length > 0
			? recipe.ingredients.map((ing, i) => ({ ...ing, key: i }))
			: [{ name: null, amount: null, key: 0 }],
	);
	const [steps, setSteps] = useState<Step[]>(
		recipe.steps.length > 0
			? recipe.steps.map((text, i) => ({ text, key: i }))
			: [{ text: "", key: 0 }],
	);

	function addIngredient() {
		const key = ingredientKeyRef.current++;
		setIngredients((prev) => [...prev, { name: null, amount: null, key }]);
	}

	function removeIngredient(key: number) {
		setIngredients((prev) => prev.filter((ing) => ing.key !== key));
	}

	function updateIngredient(
		key: number,
		field: "name" | "amount",
		value: string,
	) {
		setIngredients((prev) =>
			prev.map((ing) =>
				ing.key === key ? { ...ing, [field]: value || null } : ing,
			),
		);
	}

	function addStep() {
		const key = stepKeyRef.current++;
		setSteps((prev) => [...prev, { text: "", key }]);
	}

	function removeStep(key: number) {
		setSteps((prev) => prev.filter((s) => s.key !== key));
	}

	function updateStep(key: number, value: string) {
		setSteps((prev) =>
			prev.map((s) => (s.key === key ? { ...s, text: value } : s)),
		);
	}

	return (
		<>
			<title>{`Edit: ${recipe.title} | Homethings`}</title>
			<Form method="post">
				<div className="space-y-6">
					<div className="flex items-center justify-between">
						<Button variant="ghost" size="sm" asChild>
							<Link to={`/app/recipes/${recipe.id}`}>&#8592; Back</Link>
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? "Saving..." : "Save"}
						</Button>
					</div>

					<ScrollArea className="h-[calc(100vh-12rem)]">
						<div className="space-y-4 pr-4">
							<Card>
								<CardHeader>
									<h1 className="text-2xl font-bold">Edit Recipe</h1>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="space-y-2">
										<label
											htmlFor={`${id}-title`}
											className="text-sm font-medium"
										>
											Title
										</label>
										<Input
											id={`${id}-title`}
											name="title"
											defaultValue={recipe.title}
											placeholder="Recipe title"
											required
										/>
									</div>
									<div className="space-y-2">
										<label
											htmlFor={`${id}-description`}
											className="text-sm font-medium"
										>
											Description
										</label>
										<Input
											id={`${id}-description`}
											name="description"
											defaultValue={recipe.description ?? ""}
											placeholder="Brief description..."
										/>
									</div>
									<div className="space-y-2">
										<label
											htmlFor={`${id}-tags`}
											className="text-sm font-medium"
										>
											Tags (comma-separated)
										</label>
										<Input
											id={`${id}-tags`}
											name="tags"
											defaultValue={recipe.tags.join(", ")}
											placeholder="breakfast, quick, healthy"
										/>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader className="flex-row items-center justify-between">
									<h2 className="text-lg font-semibold">Ingredients</h2>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={addIngredient}
									>
										+ Add
									</Button>
								</CardHeader>
								<CardContent className="space-y-3">
									{ingredients.map((ing) => (
										<div key={ing.key} className="flex gap-2 items-start">
											<Input
												name={`ingredient-name-${ing.key}`}
												placeholder="Ingredient name"
												defaultValue={ing.name ?? ""}
												onChange={(e) =>
													updateIngredient(ing.key, "name", e.target.value)
												}
												className="flex-1"
											/>
											<Input
												name={`ingredient-amount-${ing.key}`}
												placeholder="Amount (optional)"
												defaultValue={ing.amount ?? ""}
												onChange={(e) =>
													updateIngredient(ing.key, "amount", e.target.value)
												}
												className="w-32"
											/>
											{ingredients.length > 1 && (
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() => removeIngredient(ing.key)}
												>
													&times;
												</Button>
											)}
										</div>
									))}
								</CardContent>
							</Card>

							<Card>
								<CardHeader className="flex-row items-center justify-between">
									<h2 className="text-lg font-semibold">Steps</h2>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={addStep}
									>
										+ Add
									</Button>
								</CardHeader>
								<CardContent className="space-y-3">
									{steps.map((step, index) => (
										<div key={step.key} className="flex gap-2 items-start">
											<span className="font-bold text-muted-foreground shrink-0 mt-2.5 w-6 text-right">
												{index + 1}.
											</span>
											<Input
												name={`step-${step.key}`}
												placeholder={`Step ${index + 1}`}
												defaultValue={step.text}
												onChange={(e) => updateStep(step.key, e.target.value)}
												className="flex-1"
											/>
											{steps.length > 1 && (
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() => removeStep(step.key)}
												>
													&times;
												</Button>
											)}
										</div>
									))}
								</CardContent>
							</Card>
						</div>
					</ScrollArea>
				</div>
			</Form>
		</>
	);
}

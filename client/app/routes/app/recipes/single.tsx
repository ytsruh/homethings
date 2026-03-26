import { Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, redirect, useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
	deleteRecipe,
	getRecipe,
	updateRecipe,
	type Ingredient,
	type Recipe,
} from "~/lib/recipes";

export async function clientLoader({
	params,
}: {
	params: Promise<{ recipeId: string }>;
}) {
	const { recipeId } = await params;
	try {
		const recipe = await getRecipe(recipeId);
		if (!recipe) {
			throw redirect("/app/recipes");
		}
		return { recipe };
	} catch {
		throw redirect("/app/recipes");
	}
}

export default function RecipeDetailPage({
	loaderData,
}: {
	loaderData: Awaited<ReturnType<typeof clientLoader>>;
}) {
	const { recipe: initialRecipe } = loaderData;
	const navigate = useNavigate();

	const [recipe, setRecipe] = useState<Recipe>(initialRecipe);
	const [title, setTitle] = useState(recipe.title);
	const [description, setDescription] = useState(recipe.description || "");
	const [tags, setTags] = useState(recipe.tags.join(", "));
	const [ingredients, setIngredients] = useState<Ingredient[]>(
		recipe.ingredients,
	);
	const [steps, setSteps] = useState<string[]>(recipe.steps);
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [newIngredientName, setNewIngredientName] = useState("");
	const [newIngredientAmount, setNewIngredientAmount] = useState("");
	const [newStep, setNewStep] = useState("");

	useEffect(() => {
		setRecipe(initialRecipe);
		setTitle(initialRecipe.title);
		setDescription(initialRecipe.description || "");
		setTags(initialRecipe.tags.join(", "));
		setIngredients(initialRecipe.ingredients);
		setSteps(initialRecipe.steps);
	}, [initialRecipe]);

	async function handleSave() {
		setIsSaving(true);
		try {
			const updated = await updateRecipe(recipe.id, {
				title,
				description: description || undefined,
				tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
				ingredients,
				steps,
			});
			setRecipe(updated);
			toast.success("Recipe saved");
		} catch (error) {
			console.error("Failed to save recipe:", error);
			toast.error("Failed to save recipe");
		} finally {
			setIsSaving(false);
		}
	}

	async function handleDelete() {
		try {
			await deleteRecipe(recipe.id);
			toast.success("Recipe deleted");
			navigate("/app/recipes");
		} catch (error) {
			console.error("Failed to delete recipe:", error);
			toast.error("Failed to delete recipe");
		}
	}

	function addIngredient() {
		if (!newIngredientName.trim()) return;
		setIngredients([
			...ingredients,
			{ name: newIngredientName, amount: newIngredientAmount },
		]);
		setNewIngredientName("");
		setNewIngredientAmount("");
	}

	function removeIngredient(index: number) {
		setIngredients(ingredients.filter((_, i) => i !== index));
	}

	function addStep() {
		if (!newStep.trim()) return;
		setSteps([...steps, newStep]);
		setNewStep("");
	}

	function removeStep(index: number) {
		setSteps(steps.filter((_, i) => i !== index));
	}

	return (
		<>
			<title>{recipe.title} | Homethings</title>
			<meta
				name="description"
				content={recipe.description || "Recipe details"}
			/>
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<Button variant="ghost" size="sm" asChild>
						<Link to="/app/recipes">&#8592; Back</Link>
					</Button>
					<Button
						variant="destructive"
						size="sm"
						onClick={() => setIsDeleteOpen(true)}
					>
						<Trash2 className="h-4 w-4 sm:mr-2" />
						<span className="hidden sm:inline">Delete</span>
					</Button>
				</div>

				<Card>
					<CardHeader>
						<div className="flex items-start justify-between gap-4">
							<div className="flex-1 space-y-4">
								<Input
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									placeholder="Recipe title"
									className="text-xl font-bold"
								/>
								<Textarea
									value={description}
									onChange={(e) =>
										setDescription(e.target.value)
									}
									placeholder="Recipe description..."
									className="min-h-[60px]"
								/>
								<Input
									value={tags}
									onChange={(e) => setTags(e.target.value)}
									placeholder="Tags (comma-separated)"
								/>
							</div>
							<Button onClick={handleSave} disabled={isSaving}>
								{isSaving ? "Saving..." : "Save"}
							</Button>
						</div>
					</CardHeader>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Ingredients</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex gap-2">
							<Input
								placeholder="Ingredient name"
								value={newIngredientName}
								onChange={(e) =>
									setNewIngredientName(e.target.value)
								}
								className="flex-1"
							/>
							<Input
								placeholder="Amount (optional)"
								value={newIngredientAmount}
								onChange={(e) =>
									setNewIngredientAmount(e.target.value)
								}
								className="w-32"
							/>
							<Button onClick={addIngredient} size="sm">
								<Plus className="h-4 w-4" />
							</Button>
						</div>
						{ingredients.length > 0 ? (
							<ul className="space-y-2">
								{ingredients.map((ing, idx) => (
									<li
										key={`${idx}-${ing.name}`}
										className="flex items-center justify-between border-b pb-2 last:border-0"
									>
										<span>
											<span className="font-medium">
												{ing.name}
											</span>
											{ing.amount && (
												<span className="text-muted-foreground ml-2">
													{ing.amount}
												</span>
											)}
										</span>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => 									removeIngredient(idx)}
										>
											<X className="h-4 w-4" />
										</Button>
									</li>
								))}
							</ul>
						) : (
							<p className="text-sm text-muted-foreground">
								No ingredients added yet
							</p>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Steps</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex gap-2">
							<Textarea
								placeholder="Add a step..."
								value={newStep}
								onChange={(e) => setNewStep(e.target.value)}
								className="flex-1 min-h-[60px]"
							/>
							<Button onClick={addStep} size="sm">
								<Plus className="h-4 w-4" />
							</Button>
						</div>
						{steps.length > 0 ? (
							<ol className="space-y-3">
								{steps.map((step, idx) => (
									<li
										key={`step-${step.slice(0, 20)}-${idx}`}
										className="flex gap-3 border-b pb-3 last:border-0"
									>
										<span className="font-bold text-muted-foreground">
											{											idx + 1}.
										</span>
										<div className="flex-1 flex items-start justify-between gap-2">
											<span>{step}</span>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => removeStep(idx)}
											>
												<X className="h-4 w-4" />
											</Button>
										</div>
									</li>
								))}
							</ol>
						) : (
							<p className="text-sm text-muted-foreground">
								No steps added yet
							</p>
						)}
					</CardContent>
				</Card>

				<Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Delete Recipe</DialogTitle>
							<DialogDescription>
								Are you sure you want to delete this recipe? This
								action cannot be undone.
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setIsDeleteOpen(false)}
							>
								Cancel
							</Button>
							<Button variant="destructive" onClick={handleDelete}>
								Delete
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</>
	);
}

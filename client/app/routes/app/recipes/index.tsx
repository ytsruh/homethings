import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLoaderData, useSearchParams } from "react-router";
import { toast } from "sonner";
import PageHeader from "~/components/PageHeader";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Textarea } from "~/components/ui/textarea";
import {
	createRecipe,
	getRecipes,
	type Recipe,
} from "~/lib/recipes";

export async function clientLoader({ request }: { request: Request }) {
	const url = new URL(request.url);
	const tag = url.searchParams.get("tag") || undefined;

	try {
		const recipes = await getRecipes(tag);
		return { recipes };
	} catch {
		return { recipes: [] };
	}
}

export default function RecipesPage() {
	const initialData = useLoaderData<typeof clientLoader>();
	const [searchParams, setSearchParams] = useSearchParams();
	const [recipes, setRecipes] = useState<Recipe[]>(initialData.recipes);
	const [searchQuery, setSearchQuery] = useState("");
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [newTitle, setNewTitle] = useState("");
	const [newDescription, setNewDescription] = useState("");
	const [newTags, setNewTags] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		setRecipes(initialData.recipes);
	}, [initialData.recipes]);

	const allTags = [
		...new Set(recipes.flatMap((r) => r.tags ?? [])),
	].filter(Boolean);

	const filteredRecipes = recipes.filter((recipe) => {
		if (!searchQuery) return true;
		const query = searchQuery.toLowerCase();
		return (
			recipe.title.toLowerCase().includes(query) ||
			recipe.description?.toLowerCase().includes(query) ||
			recipe.tags.some((t) => t.toLowerCase().includes(query))
		);
	});

	async function handleCreate() {
		if (!newTitle.trim()) {
			toast.error("Title is required");
			return;
		}

		setIsLoading(true);
		try {
			const tags = newTags
				.split(",")
				.map((t) => t.trim())
				.filter(Boolean);
			const recipe = await createRecipe({
				title: newTitle,
				description: newDescription || undefined,
				tags,
				ingredients: [],
				steps: [],
			});
			setRecipes((prev) => [recipe, ...prev]);
			setNewTitle("");
			setNewDescription("");
			setNewTags("");
			setIsCreateOpen(false);
			toast.success("Recipe created");
		} catch (error) {
			console.error("Failed to create recipe:", error);
			toast.error("Failed to create recipe");
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<>
			<title>Recipes | Homethings</title>
			<meta name="description" content="Your recipes" />
			<div className="space-y-6">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<PageHeader title="Recipes" subtitle="Your recipe collection" />
					<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
						<DialogTrigger asChild>
							<div className="py-2 flex items-center justify-end gap-2">
								<Button>
									<Plus className="h-4 w-4 mr-2" />
									New Recipe
								</Button>
							</div>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Create New Recipe</DialogTitle>
								<DialogDescription>
									Add a new recipe to your collection.
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4 py-4">
								<div className="space-y-2">
									<label
										htmlFor="title"
										className="text-sm font-medium"
									>
										Title
									</label>
									<Input
										id="title"
										placeholder="Recipe title"
										value={newTitle}
										onChange={(e) =>
											setNewTitle(e.target.value)
										}
										onKeyDown={(e) => {
											if (
												e.key === "Enter" &&
												!e.shiftKey
											) {
												e.preventDefault();
												handleCreate();
											}
										}}
									/>
								</div>
								<div className="space-y-2">
									<label
										htmlFor="description"
										className="text-sm font-medium"
									>
										Description (optional)
									</label>
									<Textarea
										id="description"
										placeholder="Brief description..."
										value={newDescription}
										onChange={(e) =>
											setNewDescription(e.target.value)
										}
										rows={3}
									/>
								</div>
								<div className="space-y-2">
									<label
										htmlFor="tags"
										className="text-sm font-medium"
									>
										Tags (comma-separated)
									</label>
									<Input
										id="tags"
										placeholder="breakfast, quick, healthy"
										value={newTags}
										onChange={(e) =>
											setNewTags(e.target.value)
										}
									/>
								</div>
							</div>
							<DialogFooter>
								<Button
									variant="outline"
									onClick={() => {
										setNewTitle("");
										setNewDescription("");
										setNewTags("");
										setIsCreateOpen(false);
									}}
								>
									Cancel
								</Button>
								<Button
									onClick={handleCreate}
									disabled={isLoading || !newTitle.trim()}
								>
									{isLoading ? "Creating..." : "Create"}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>

				<div className="flex flex-col sm:flex-row gap-4">
					<Input
						placeholder="Search recipes..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="sm:max-w-xs"
					/>
					{allTags.length > 0 && (
						<div className="flex flex-wrap gap-2">
							{allTags.map((tag) => (
								<Badge
									key={tag}
									variant={
										searchParams.get("tag") === tag
											? "default"
											: "outline"
									}
									className="cursor-pointer"
									onClick={() => {
										if (searchParams.get("tag") === tag) {
											setSearchParams({});
										} else {
											setSearchParams({ tag });
										}
									}}
								>
									{tag}
								</Badge>
							))}
						</div>
					)}
				</div>

				{filteredRecipes.length === 0 ? (
					<div className="text-center py-12">
						<p className="text-muted-foreground">
							{searchQuery
								? "No recipes match your search"
								: "No recipes yet. Create your first recipe!"}
						</p>
					</div>
				) : (
					<ScrollArea className="w-full h-[65vh] sm:h-[75vh] md:h-[68vh]">
						<div className="w-full grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
							{filteredRecipes.map((recipe) => (
								<Link
									key={recipe.id}
									to={`/app/recipes/${recipe.id}`}
									className="block"
								>
									<Card className="hover:shadow-md transition-shadow cursor-pointer h-full max-w-full">
										<CardHeader className="pb-2">
											<CardTitle className="text-lg line-clamp-1">
												{recipe.title}
											</CardTitle>
											{recipe.tags.length > 0 && (
												<div className="flex flex-wrap gap-1 mt-2">
													{recipe.tags
														.slice(0, 3)
														.map((tag) => (
															<Badge
																key={tag}
																variant="secondary"
															>
																{tag}
															</Badge>
														))}
													{recipe.tags.length > 3 && (
														<Badge variant="outline">
															+{recipe.tags.length - 3}
														</Badge>
													)}
												</div>
											)}
										</CardHeader>
										<CardContent>
											<p className="text-sm text-muted-foreground line-clamp-2">
												{recipe.description ||
													"No description"}
											</p>
											<div className="text-xs text-muted-foreground mt-2">
												<span>
													{recipe.ingredients
														.length}
													{" ingredients"}
												</span>
												<span className="mx-1">|</span>
												<span>
													{recipe.steps.length} steps
												</span>
											</div>
										</CardContent>
									</Card>
								</Link>
							))}
						</div>
					</ScrollArea>
				)}
			</div>
		</>
	);
}

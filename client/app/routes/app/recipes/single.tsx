import { ImageIcon, Pencil, Trash2 } from "lucide-react";
import { useFetcher, Link, redirect, useLoaderData } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { ScrollArea } from "~/components/ui/scroll-area";
import { RecipeResponseSchema } from "~/lib/schemas/recipes";
import type { Route } from "./+types/single";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
	const { recipeId } = params;

	const recipeRes = await fetch(
		`${import.meta.env.VITE_API_BASE_URL}/api/recipes/${recipeId}`,
		{
			credentials: "include",
		},
	);

	if (!recipeRes.ok) {
		throw redirect("/app/recipes");
	}

	const recipeData = await recipeRes.json();
	const recipe = RecipeResponseSchema.parse(recipeData);

	let imageUrl: string | null = null;
	if (recipe.imageKey) {
		try {
			const imageUrlRes = await fetch(
				`${import.meta.env.VITE_API_BASE_URL}/api/recipes/${recipeId}/image-url`,
				{ credentials: "include" },
			);
			if (imageUrlRes.ok) {
				const imageData = (await imageUrlRes.json()) as unknown as {
					presignedUrl: string;
				};
				imageUrl = imageData.presignedUrl;
			}
		} catch {
			imageUrl = null;
		}
	}

	return { recipe, imageUrl };
}

export default function RecipeDetailPage() {
	const { recipe, imageUrl } = useLoaderData<typeof clientLoader>();

	return (
		<>
			<title>{recipe.title} | Homethings</title>
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<Button variant="ghost" size="sm" asChild>
						<Link to="/app/recipes">&#8592; Back</Link>
					</Button>
					<div className="flex gap-2">
						<Button variant="ghost" size="sm">
							<Pencil className="h-4 w-4 mr-1" />
							Edit
						</Button>
						<DeleteRecipeModal recipeId={recipe.id} recipeTitle={recipe.title} />
					</div>
				</div>

				<ScrollArea className="h-185 md:h-165 w-full">
					<div className="grid grid-cols-1 gap-4">
						<Card className="overflow-hidden">
							{imageUrl ? (
								<img
									src={imageUrl}
									alt={recipe.title}
									className="w-full aspect-video object-cover"
								/>
							) : (
								<div className="w-full aspect-video max-h-[30vh] bg-muted flex items-center justify-center">
									<ImageIcon className="h-12 w-12 text-muted-foreground/30" />
								</div>
							)}
							<CardHeader>
								<h1 className="text-2xl font-bold">{recipe.title}</h1>
								{recipe.description && (
									<p className="text-muted-foreground">{recipe.description}</p>
								)}
								{recipe.tags.length > 0 && (
									<div className="flex gap-1 flex-wrap">
										{recipe.tags.map((tag: string) => (
											<span
												key={tag}
												className="text-xs px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full"
											>
												{tag}
											</span>
										))}
									</div>
								)}
							</CardHeader>
						</Card>

						<div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
							<Card>
								<CardHeader>
									<h2 className="text-lg font-semibold">Ingredients</h2>
								</CardHeader>
								<CardContent>
									{recipe.ingredients.length === 0 ? (
										<p className="text-sm text-muted-foreground">
											No ingredients
										</p>
									) : (
										<ul className="space-y-2">
											{recipe.ingredients.map(
												(ingredient: {
													name: string | null;
													amount: string | null;
												}) => (
													<li
														key={`ingredient-${ingredient.name ?? ""}-${ingredient.amount ?? ""}`}
														className="flex gap-3"
													>
														<span className="font-medium">
															{ingredient.name || "—"}
														</span>
														{ingredient.amount && (
															<span className="text-muted-foreground">
																— {ingredient.amount}
															</span>
														)}
													</li>
												),
											)}
										</ul>
									)}
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<h2 className="text-lg font-semibold">Steps</h2>
								</CardHeader>
								<CardContent>
									{recipe.steps.length === 0 ? (
										<p className="text-sm text-muted-foreground">No steps</p>
									) : (
										<ol className="space-y-3">
											{recipe.steps.map((step: string, i: number) => (
												<li key={step} className="flex gap-3">
													<span className="font-bold text-muted-foreground shrink-0">
														{i + 1}.
													</span>
													<span>{step}</span>
												</li>
											))}
										</ol>
									)}
								</CardContent>
							</Card>
						</div>
					</div>
				</ScrollArea>
			</div>
		</>
	);
}

type DeleteRecipeModalProps = {
	recipeId: string;
	recipeTitle: string;
};

function DeleteRecipeModal({ recipeId, recipeTitle }: DeleteRecipeModalProps) {
	const fetcher = useFetcher();

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="destructive" size="sm">
					<Trash2 className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete Recipe</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete "{recipeTitle}"? This action cannot
						be undone.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Cancel</Button>
					</DialogClose>
					<fetcher.Form method="post" action={`/app/recipes/${recipeId}/delete`}>
						<Button
							type="submit"
							variant="destructive"
							disabled={fetcher.state !== "idle"}
						>
							{fetcher.state !== "idle" ? "Deleting..." : "Delete"}
						</Button>
					</fetcher.Form>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

import { ImageIcon, Plus, Upload } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import {
	Link,
	redirect,
	useFetcher,
	useLoaderData,
	useNavigate,
	useSearchParams,
} from "react-router";
import PageHeader from "~/components/PageHeader";
import { toast } from "~/components/Toaster";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
	extractRecipeFromImage,
	type Recipe,
	RecipeResponseSchema,
} from "~/lib/schemas/recipes";
import type { Route } from "./+types/index";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
	const url = new URL(request.url);
	const tag = url.searchParams.get("tag") || undefined;

	let apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/recipes`;
	if (tag) {
		apiUrl += `?tag=${encodeURIComponent(tag)}`;
	}

	let recipes: Recipe[] = [];
	try {
		const response = await fetch(apiUrl, { credentials: "include" });
		const text = await response.text();
		if (text) {
			const data = JSON.parse(text) as unknown;
			recipes = RecipeResponseSchema.array().parse(data);
		}
	} catch (e) {
		console.error("Failed to fetch recipes:", e);
	}

	const imageUrls: Record<string, string | null> = {};
	for (const recipe of recipes) {
		imageUrls[recipe.id] = recipe.imageKey
			? `${import.meta.env.VITE_PUBLIC_IMAGE_BASE_URL}/${recipe.imageKey}?v=${recipe.updatedAt}`
			: null;
	}

	return { recipes, imageUrls };
}

export async function clientAction({ request }: Route.ClientActionArgs) {
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

	try {
		const response = await fetch(
			`${import.meta.env.VITE_API_BASE_URL}/api/recipes`,
			{
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					title,
					description: description || undefined,
					tags,
				}),
			},
		);

		if (!response.ok) {
			const error = await response.json().catch(() => ({}));
			throw new Error(error.error || "Failed to create recipe");
		}

		toast({
			title: "Success",
			description: "Recipe created successfully",
		});
		return redirect("/app/recipes");
	} catch (error) {
		console.error("Failed to create recipe:", error);
		toast({
			title: "Error",
			description:
				error instanceof Error ? error.message : "Failed to create recipe",
			type: "destructive",
		});
		return false;
	}
}

export default function RecipesPage() {
	const id = useId();
	const { recipes, imageUrls } = useLoaderData<typeof clientLoader>();
	const [searchQuery, setSearchQuery] = useState("");
	const [searchParams, setSearchParams] = useSearchParams();
	const activeTag = searchParams.get("tag") || null;
	const fetcher = useFetcher();
	const formRef = useRef<HTMLFormElement>(null);
	const [extractOpen, setExtractOpen] = useState(false);
	const [extracting, setExtracting] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const newRecipeDialogRef = useRef<HTMLButtonElement>(null);
	const navigate = useNavigate();

	const allTags = [...new Set(recipes.flatMap((r) => r.tags))].sort();

	const filteredRecipes = recipes.filter((recipe: Recipe) => {
		if (activeTag && !recipe.tags.includes(activeTag)) return false;
		if (!searchQuery) return true;
		const query = searchQuery.toLowerCase();
		return (
			recipe.title.toLowerCase().includes(query) ||
			recipe.description?.toLowerCase().includes(query)
		);
	});

	useEffect(() => {
		if (fetcher.state === "idle" && fetcher.data) {
			formRef.current?.reset();
		}
	}, [fetcher.state, fetcher.data]);

	const handleExtractFromImage = async (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith("image/")) {
			toast({
				title: "Error",
				description: "Please select an image file",
				type: "destructive",
			});
			return;
		}

		const maxSize = 5 * 1024 * 1024;
		if (file.size > maxSize) {
			toast({
				title: "Error",
				description: "Image must be smaller than 5MB",
				type: "destructive",
			});
			return;
		}

		setExtracting(true);

		try {
			const reader = new FileReader();
			reader.onload = async (event) => {
				const base64 = event.target?.result as string;
				const recipe = await extractRecipeFromImage(base64);
				toast({
					title: "Success",
					description: `Recipe "${recipe.title}" created from image`,
				});
				setExtractOpen(false);
				navigate(`/app/recipes/${recipe.id}`);
			};
			reader.onerror = () => {
				toast({
					title: "Error",
					description: "Failed to read image file",
					type: "destructive",
				});
				setExtracting(false);
			};
			reader.readAsDataURL(file);
		} catch (error) {
			console.error("Failed to extract recipe:", error);
			toast({
				title: "Error",
				description:
					error instanceof Error
						? error.message
						: "Failed to extract recipe from image",
				type: "destructive",
			});
			setExtracting(false);
		}
	};

	return (
		<>
			<title>Recipes | Homethings</title>
			<meta name="description" content="Your recipes" />
			<div className="space-y-6">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<PageHeader title="Recipes" subtitle="Your recipe collection" />
					<div className="py-2 flex items-center justify-end gap-2">
						<Button
							variant="outline"
							onClick={() => fileInputRef.current?.click()}
							disabled={extracting}
						>
							{extracting ? (
								<>
									<span className="h-4 w-4 mr-2 animate-spin">⟳</span>
									Generating...
								</>
							) : (
								<>
									<Upload className="h-4 w-4 mr-2" />
									Create from Image
								</>
							)}
						</Button>
						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							className="hidden"
							onChange={handleExtractFromImage}
						/>
						<Dialog>
							<DialogTrigger asChild>
								<Button>
									<Plus className="h-4 w-4 mr-2" />
									New Recipe
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>New Recipe</DialogTitle>
								</DialogHeader>
								<fetcher.Form
									ref={formRef}
									method="post"
									className="space-y-4 py-4"
									onSubmit={(e) => {
										e.preventDefault();
										const formData = new FormData(e.currentTarget);
										fetcher.submit(formData, { method: "post" });
									}}
								>
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
											placeholder="Recipe title"
											required
										/>
									</div>
									<div className="space-y-2">
										<label
											htmlFor={`${id}-description`}
											className="text-sm font-medium"
										>
											Description (optional)
										</label>
										<Input
											id={`${id}-description`}
											name="description"
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
											placeholder="breakfast, quick, healthy"
										/>
									</div>
									<DialogFooter>
										<DialogClose asChild>
											<Button variant="outline">Cancel</Button>
										</DialogClose>
										<Button type="submit" disabled={fetcher.state !== "idle"}>
											{fetcher.state !== "idle" ? "Creating..." : "Create"}
										</Button>
									</DialogFooter>
								</fetcher.Form>
							</DialogContent>
						</Dialog>
					</div>
				</div>

				<Input
					placeholder="Search recipes..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="sm:max-w-xs"
				/>

				{allTags.length > 0 && (
					<div className="flex gap-2 flex-wrap">
						<Button
							variant={!activeTag ? "default" : "outline"}
							size="sm"
							onClick={() => setSearchParams({})}
						>
							All
						</Button>
						{allTags.map((tag) => (
							<Button
								key={tag}
								variant={activeTag === tag ? "default" : "outline"}
								size="sm"
								onClick={() => setSearchParams({ tag })}
							>
								{tag}
							</Button>
						))}
					</div>
				)}

				{filteredRecipes.length === 0 ? (
					<div className="text-center py-12">
						<p className="text-muted-foreground">
							{searchQuery || activeTag
								? "No recipes match your filters"
								: "No recipes yet"}
						</p>
					</div>
				) : (
					<ScrollArea
						className={`w-full ${allTags.length > 0 ? "h-[72vh] md:h-[60vh]" : "h-[80vh] md:h-[68vh]"} pb-5`}
					>
						<div className="w-full grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
							{filteredRecipes.map((recipe: Recipe) => {
								const imageUrl = imageUrls[recipe.id];
								return (
									<Link
										key={recipe.id}
										to={`/app/recipes/${recipe.id}`}
										className="block"
									>
										<Card className="hover:shadow-md transition-shadow cursor-pointer h-full max-w-full overflow-hidden">
											{imageUrl ? (
												<img
													src={imageUrl}
													alt={recipe.title}
													className="aspect-video w-full object-cover"
												/>
											) : (
												<div className="aspect-video w-full bg-muted flex items-center justify-center">
													<ImageIcon className="h-10 w-10 text-muted-foreground/50" />
												</div>
											)}
											<CardHeader>
												<CardTitle className="text-lg line-clamp-1">
													{recipe.title}
												</CardTitle>
											</CardHeader>
											<CardContent>
												<p className="text-sm text-muted-foreground line-clamp-2">
													{recipe.description || "No description"}
												</p>
												<div className="flex gap-1 mt-2 flex-wrap">
													{recipe.tags.map((tag: string) => (
														<Badge key={tag} variant="secondary">
															{tag}
														</Badge>
													))}
												</div>
											</CardContent>
										</Card>
									</Link>
								);
							})}
						</div>
					</ScrollArea>
				)}
			</div>
		</>
	);
}

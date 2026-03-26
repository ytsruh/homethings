import { ImageIcon, Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
	Link,
	redirect,
	useFetcher,
	useLoaderData,
	useRevalidator,
} from "react-router";
import { toast } from "~/components/Toaster";
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
import {
	RecipeResponseSchema,
	removeRecipeImage,
	uploadRecipeImage,
} from "~/lib/schemas/recipes";
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

	const imageUrl = recipe.imageKey
		? `${import.meta.env.VITE_PUBLIC_IMAGE_BASE_URL}/${recipe.imageKey}?v=${recipe.updatedAt}`
		: null;

	return { recipe, imageUrl };
}

export default function RecipeDetailPage() {
	const { recipe, imageUrl } = useLoaderData<typeof clientLoader>();

	return (
		<>
			<title>{`${recipe.title} | Homethings`}</title>
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<Button variant="ghost" size="sm" asChild>
						<Link to="/app/recipes">&#8592; Back</Link>
					</Button>
					<div className="flex gap-2">
						<Button variant="ghost" size="sm" asChild>
							<Link to={`/app/recipes/${recipe.id}/edit`}>
								<Pencil className="h-4 w-4 mr-1" />
							</Link>
						</Button>
						<DeleteRecipeModal
							recipeId={recipe.id}
							recipeTitle={recipe.title}
						/>
					</div>
				</div>

				<ScrollArea className="h-185 md:h-165 w-full">
					<div className="grid grid-cols-1 gap-4">
						<Card className="overflow-hidden">
							<RecipeImageEditor recipeId={recipe.id} imageUrl={imageUrl} />
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
					<fetcher.Form
						method="post"
						action={`/app/recipes/${recipeId}/delete`}
					>
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

type RecipeImageEditorProps = {
	recipeId: string;
	imageUrl: string | null;
};

type RemoveImageModalProps = {
	recipeId: string;
	isOpen: boolean;
	onClose: () => void;
	onRemoved: () => void;
};

function RemoveImageModal({
	recipeId,
	isOpen,
	onClose,
	onRemoved,
}: RemoveImageModalProps) {
	const fetcher = useFetcher();

	async function handleRemove() {
		try {
			await removeRecipeImage(recipeId);
			toast({ title: "Success", description: "Image removed" });
			onClose();
			onRemoved();
		} catch (error) {
			toast({
				title: "Error",
				description:
					error instanceof Error ? error.message : "Failed to remove image",
				type: "destructive",
			});
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Remove Image</DialogTitle>
					<DialogDescription>
						Are you sure you want to remove this image? This action cannot be
						undone.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Cancel</Button>
					</DialogClose>
					<Button
						variant="destructive"
						onClick={handleRemove}
						disabled={fetcher.state !== "idle"}
					>
						{fetcher.state !== "idle" ? "Removing..." : "Remove"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function RecipeImageEditor({ recipeId, imageUrl }: RecipeImageEditorProps) {
	const revalidator = useRevalidator();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isUploadOpen, setIsUploadOpen] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [isRemoveOpen, setIsRemoveOpen] = useState(false);

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0] ?? null;
		setSelectedFile(file);
		if (file) {
			const reader = new FileReader();
			reader.onload = () => setPreviewUrl(reader.result as string);
			reader.readAsDataURL(file);
		} else {
			setPreviewUrl(null);
		}
	}

	async function handleUpload() {
		if (!selectedFile) return;

		if (selectedFile.size > 5 * 1024 * 1024) {
			toast({
				title: "Error",
				description: "File must be under 5MB",
				type: "destructive",
			});
			return;
		}

		setIsUploading(true);
		try {
			const { imageKey } = await uploadRecipeImage(recipeId, selectedFile);
			await fetch(
				`${import.meta.env.VITE_API_BASE_URL}/api/recipes/${recipeId}`,
				{
					method: "PATCH",
					credentials: "include",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ imageKey }),
				},
			);
			toast({ title: "Success", description: "Image uploaded" });
			setIsUploadOpen(false);
			setSelectedFile(null);
			setPreviewUrl(null);
			revalidator.revalidate();
		} catch (error) {
			toast({
				title: "Error",
				description:
					error instanceof Error ? error.message : "Failed to upload image",
				type: "destructive",
			});
		} finally {
			setIsUploading(false);
		}
	}

	function closeUpload() {
		setIsUploadOpen(false);
		setSelectedFile(null);
		setPreviewUrl(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	}

	return (
		<>
			<div className="relative w-full aspect-video max-h-[30vh] bg-muted overflow-hidden">
				{imageUrl ? (
					<img
						src={imageUrl}
						alt="Recipe"
						className="w-full h-full object-cover"
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center">
						<ImageIcon className="h-12 w-12 text-muted-foreground/30" />
					</div>
				)}
				<div className="absolute bottom-2 right-2 flex gap-2">
					<Button
						size="sm"
						variant="secondary"
						onClick={() => setIsUploadOpen(true)}
					>
						<Pencil className="h-3 w-3 mr-1" />
						{imageUrl ? "Change" : "Add image"}
					</Button>
					{imageUrl && (
						<Button
							size="sm"
							variant="destructive"
							onClick={() => setIsRemoveOpen(true)}
						>
							<Trash2 className="h-3 w-3" />
						</Button>
					)}
				</div>
			</div>

			<RemoveImageModal
				recipeId={recipeId}
				isOpen={isRemoveOpen}
				onClose={() => setIsRemoveOpen(false)}
				onRemoved={() => {
					setIsRemoveOpen(false);
					revalidator.revalidate();
				}}
			/>

			<Dialog
				open={isUploadOpen}
				onOpenChange={(open) => !open && closeUpload()}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{imageUrl ? "Change Image" : "Add Image"}</DialogTitle>
						<DialogDescription>
							Upload an image (JPEG, PNG, WebP, or GIF, max 5MB).
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						{(previewUrl || imageUrl) && (
							<img
								src={previewUrl ?? imageUrl ?? ""}
								alt="Preview"
								className="w-full aspect-video object-cover rounded-md"
							/>
						)}
						<input
							ref={fileInputRef}
							type="file"
							accept="image/jpeg,image/png,image/webp,image/gif"
							onChange={handleFileChange}
							className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-input file:text-sm file:font-medium file:bg-background hover:file:bg-muted"
						/>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={closeUpload}>
							Cancel
						</Button>
						<Button
							onClick={handleUpload}
							disabled={!selectedFile || isUploading}
						>
							{isUploading ? "Uploading..." : "Upload"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}

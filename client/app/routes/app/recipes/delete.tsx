import { redirect } from "react-router";
import { toast } from "~/components/Toaster";
import type { Route } from "./+types/delete";

export async function clientAction({ params }: Route.ClientActionArgs) {
	const { recipeId } = params;

	try {
		const response = await fetch(
			`${import.meta.env.VITE_API_BASE_URL}/api/recipes/${recipeId}`,
			{
				method: "DELETE",
				credentials: "include",
			},
		);

		if (!response.ok) {
			throw new Error("Failed to delete recipe");
		}

		toast({
			title: "Success",
			description: "Recipe deleted successfully",
		});
		return redirect("/app/recipes");
	} catch (error) {
		console.error("Failed to delete recipe:", error);
		toast({
			title: "Error",
			description:
				error instanceof Error ? error.message : "Failed to delete recipe",
			type: "destructive",
		});
		return { ok: false };
	}
}

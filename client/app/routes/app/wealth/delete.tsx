import { redirect } from "react-router";
import { toast } from "sonner";
import { deleteAccount } from "~/lib/wealth";
import type { Route } from "./+types/delete";

export async function clientAction({ params }: Route.ClientActionArgs) {
	const { accountId } = params;

	try {
		await deleteAccount(accountId);
		toast.success("Account deleted");
		return redirect("/app/wealth");
	} catch (error) {
		console.error("Failed to delete account:", error);
		toast.error("Failed to delete account");
		return { ok: false };
	}
}

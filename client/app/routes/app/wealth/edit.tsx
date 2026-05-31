import { Trash } from "lucide-react";
import { useState } from "react";
import { redirect, useLoaderData } from "react-router";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { deleteAccount, getAccounts, updateAccount } from "~/lib/wealth";
import type { Route } from "./+types/edit";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
	const { accountId } = params;

	const accounts = await getAccounts();
	const account = accounts.find((a) => a.id === accountId);

	if (!account) {
		throw redirect("/app/wealth");
	}

	return { account };
}

export async function clientAction({
	request,
	params,
}: Route.ClientActionArgs) {
	const { accountId } = params;
	const formData = await request.formData();
	const intent = formData.get("intent");

	if (intent === "delete") {
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

	return { ok: false };
}

export default function WealthAccountEditPage() {
	const { account } = useLoaderData<typeof clientLoader>();

	const [name, setName] = useState(account.name);
	const [type, setType] = useState<"asset" | "liability">(account.type);
	const [isLiquid, setIsLiquid] = useState(account.isLiquid);
	const [isClosed, setIsClosed] = useState(account.isClosed);
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleUpdate() {
		if (!name.trim()) {
			toast.error("Name is required");
			return;
		}
		setIsSubmitting(true);
		try {
			await updateAccount(account.id, { name, type, isLiquid, isClosed });
			toast.success("Account updated");
		} catch (error) {
			console.error("Failed to update account:", error);
			toast.error("Failed to update account");
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<>
			<title>{`Edit: ${account.name} | Homethings`}</title>
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<Button variant="ghost" size="sm" asChild>
						<a href="/app/wealth">&#8592; Back</a>
					</Button>
				</div>

				<div className="border rounded-lg p-6 w-full lg:w-2/3">
					<h1 className="text-2xl font-bold mb-6">Edit Account</h1>

					<div className="space-y-6">
						<div className="space-y-2">
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</div>

						<div className="space-y-2">
							<Label>Type</Label>
							<div className="flex gap-4">
								<Button
									type="button"
									variant={type === "asset" ? "default" : "outline"}
									className="flex-1"
									onClick={() => setType("asset")}
								>
									Asset
								</Button>
								<Button
									type="button"
									variant={type === "liability" ? "default" : "outline"}
									className="flex-1"
									onClick={() => setType("liability")}
								>
									Liability
								</Button>
							</div>
						</div>

						<div className="flex items-center justify-between">
							<div>
								<Label htmlFor="isLiquid">Liquid Asset</Label>
								<p className="text-sm text-muted-foreground">
									Include in liquid assets calculation
								</p>
							</div>
							<Switch
								id="isLiquid"
								checked={isLiquid}
								onCheckedChange={setIsLiquid}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div>
								<Label htmlFor="isClosed">Closed</Label>
								<p className="text-sm text-muted-foreground">
									Hide from active accounts
								</p>
							</div>
							<Switch
								id="isClosed"
								checked={isClosed}
								onCheckedChange={setIsClosed}
							/>
						</div>

						<div className="w-full items-center justify-between flex gap-2 pt-4">
							<form method="post">
								<input type="hidden" name="intent" value="delete" />
								<Button
									type="submit"
									variant="destructive"
									disabled={isSubmitting}
								>
									<Trash className="size-4" />
								</Button>
							</form>
							<Button onClick={handleUpdate} disabled={isSubmitting}>
								{isSubmitting ? "Saving..." : "Save Changes"}
							</Button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

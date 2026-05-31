import { Trash } from "lucide-react";
import { useState } from "react";
import { Form, Link, redirect, useLoaderData } from "react-router";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
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
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { getAccounts, updateAccount } from "~/lib/wealth";
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

	const name = formData.get("name") as string;
	const type = formData.get("type") as "asset" | "liability";
	const isLiquid = formData.get("isLiquid") === "true";
	const isClosed = formData.get("isClosed") === "true";

	if (!name?.trim()) {
		return { error: "Name is required" };
	}

	try {
		await updateAccount(accountId, { name, type, isLiquid, isClosed });
		toast.success("Account updated");
		return { ok: true };
	} catch (error) {
		console.error("Failed to update account:", error);
		toast.error("Failed to update account");
		return { ok: false };
	}
}

export default function WealthAccountEditPage() {
	const { account } = useLoaderData<typeof clientLoader>();

	const [name, setName] = useState(account.name);
	const [type, setType] = useState<"asset" | "liability">(account.type);
	const [isLiquid, setIsLiquid] = useState(account.isLiquid);
	const [isClosed, setIsClosed] = useState(account.isClosed);

	return (
		<>
			<title>{`Edit: ${account.name} | Homethings`}</title>
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<Button variant="ghost" size="sm" asChild>
						<Link to="/app/wealth">&#8592; Back</Link>
					</Button>
				</div>

				<div className="border rounded-lg p-6 w-full lg:w-2/3">
					<div className="flex items-center justify-between mb-6">
						<h1 className="text-2xl font-bold">Edit Account</h1>
						<Dialog>
							<DialogTrigger asChild>
								<Button type="button" variant="destructive">
									<Trash className="size-4" />
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Delete Account</DialogTitle>
									<DialogDescription>
										Are you sure you want to delete "{account.name}"? This
										action cannot be undone.
									</DialogDescription>
								</DialogHeader>
								<DialogFooter>
									<DialogClose asChild>
										<Button variant="secondary">Cancel</Button>
									</DialogClose>
									<Form
										action={`/app/wealth/${account.id}/delete`}
										method="post"
									>
										<Button type="submit" variant="destructive">
											Delete
										</Button>
									</Form>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</div>

					<Form method="post" className="space-y-6">
						<div className="space-y-2">
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								name="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</div>

						<div className="space-y-2">
							<Label>Type</Label>
							<input type="hidden" name="type" value={type} />
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
								name="isLiquid"
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
								name="isClosed"
								checked={isClosed}
								onCheckedChange={setIsClosed}
							/>
						</div>

						<div className="w-full items-center justify-end flex gap-2 pt-4">
							<Button type="submit">Save Changes</Button>
						</div>
					</Form>
				</div>
			</div>
		</>
	);
}

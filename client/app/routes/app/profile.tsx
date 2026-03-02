import { redirect, useFetcher } from "react-router";
import PageHeader from "~/components/PageHeader";
import { toast } from "~/components/Toaster";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { getCurrentUser, type User, updateUser } from "~/lib/auth";
import type { Route } from "./+types/profile";

export async function clientLoader(_args: Route.ClientLoaderArgs) {
	const { user } = await getCurrentUser();
	if (!user) {
		throw redirect("/login");
	}
	return { user };
}

export async function clientAction({ request }: Route.ClientActionArgs) {
	const formData = await request.formData();
	const name = formData.get("name") as string | null;

	try {
		await updateUser({ name: name || undefined });
		toast({ title: "Success", description: "Profile updated successfully" });
		return { ok: true };
	} catch (error) {
		console.error("Failed to update profile:", error);
		toast({
			title: "Error",
			description:
				error instanceof Error ? error.message : "Failed to update profile",
			type: "destructive",
		});
		return { ok: false };
	}
}

export default function Profile({ loaderData }: Route.ComponentProps) {
	const fetcher = useFetcher();
	const user = loaderData.user as User;

	return (
		<>
			<title>Profile | Homethings</title>
			<meta name="description" content="Welcome to Homethings" />
			<PageHeader title="Profile" subtitle="Manage your profile" />
			<fetcher.Form
				method="post"
				className="flex flex-col w-full max-w-xl items-center gap-4 py-2"
			>
				<div className="grid w-full items-center gap-1.5">
					<Label htmlFor="email">Email</Label>
					<Input defaultValue={user.email} disabled />
				</div>
				<div className="grid w-full items-center gap-1.5">
					<Label htmlFor="name">Name</Label>
					<Input
						type="text"
						name="name"
						placeholder="Name"
						defaultValue={user.name}
					/>
				</div>
				<div className="flex justify-end w-full gap-1.5">
					<Button type="submit" disabled={fetcher.state !== "idle"}>
						{fetcher.state !== "idle" ? "Updating..." : "Update"}
					</Button>
				</div>
			</fetcher.Form>
		</>
	);
}

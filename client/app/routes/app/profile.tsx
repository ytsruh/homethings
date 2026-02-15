import { redirect, useFetcher } from "react-router";
import { ZodError } from "zod";
import PageHeader from "~/components/PageHeader";
import { toast } from "~/components/Toaster";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import type { Route } from "./+types/profile";

export function meta() {
	return [
		{ title: "Profile | Homethings" },
		{ name: "description", content: "Welcome to Homethings" },
	];
}

export default function Profile({ loaderData }: Route.ComponentProps) {
	const fetcher = useFetcher();
	return (
		<>
			<PageHeader title="Profile" subtitle="Manage your profile" />
			<fetcher.Form
				method="post"
				className="flex flex-col w-full max-w-xl items-center gap-4 py-2"
			>
				<div className="grid w-full items-center gap-1.5">
					<Label htmlFor="email">Email</Label>
					<Input defaultValue="" disabled />
				</div>
				<div className="grid w-full items-center gap-1.5">
					<Label htmlFor="name">Name</Label>
					<Input type="text" name="name" placeholder="Name" defaultValue="" />
				</div>
				<div className="grid w-full grid-cols-1 lg:grid-cols-2 gap-4">
					<div className="w-full flex items-center justify-between">
						<Label htmlFor="show_chat">Show Chat</Label>
						<Switch defaultChecked={false} id="show_chat" name="show_chat" />
					</div>
					<div className="w-full flex items-center justify-between">
						<Label htmlFor="show_notes">Show Notes</Label>
						<Switch defaultChecked={false} id="show_notes" name="show_notes" />
					</div>
				</div>
				<div className="flex justify-end w-full gap-1.5">
					<Button type="submit">Update</Button>
				</div>
			</fetcher.Form>
		</>
	);
}

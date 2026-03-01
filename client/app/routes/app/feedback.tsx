import { useEffect, useRef } from "react";
import { useFetcher } from "react-router";
import PageHeader from "~/components/PageHeader";
import { toast } from "~/components/Toaster";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import type { Route } from "./+types/feedback";

const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export async function clientAction({ request }: Route.ClientActionArgs) {
	const formData = await request.formData();
	const title = formData.get("title") as string;
	const body = formData.get("body") as string;

	try {
		const response = await fetch(`${API_BASE_URL}/api/feedback`, {
			method: "POST",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ title, body }),
		});

		if (!response.ok) {
			const error = await response.json().catch(() => ({}));
			throw new Error(error.error || "Failed to submit feedback");
		}

		toast({ title: "Success", description: "Thank you for your feedback!" });
		return { ok: true };
	} catch (error) {
		console.error("Failed to submit feedback:", error);
		toast({
			title: "Error",
			description:
				error instanceof Error ? error.message : "Failed to submit feedback",
			type: "destructive",
		});
		return { ok: false };
	}
}

export default function Feedback() {
	const fetcher = useFetcher();
	const formRef = useRef<HTMLFormElement>(null);

	useEffect(() => {
		if (fetcher.state === "idle" && fetcher.data?.ok) {
			formRef.current?.reset();
		}
	}, [fetcher.state, fetcher.data]);

	const handleSubmit = () => {
		if (formRef.current) {
			const formData = new FormData(formRef.current);
			fetcher.submit(formData, { method: "post" });
		}
	};

	return (
		<>
			<title>Feedback | HomeThings</title>
			<meta name="description" content="Please give your feedback" />
			<PageHeader title="Feedback" subtitle="Please give your feedback" />
			<fetcher.Form
				ref={formRef}
				method="post"
				className="flex flex-col w-full max-w-xl items-center gap-4 py-2"
				onSubmit={(e) => {
					e.preventDefault();
					handleSubmit();
				}}
			>
				<div className="grid w-full items-center gap-1.5">
					<Label htmlFor="title">Title</Label>
					<Input name="title" placeholder="Title" required />
				</div>
				<div className="grid w-full items-center gap-1.5">
					<Label htmlFor="body">Body</Label>
					<Textarea name="body" placeholder="Body" required />
				</div>
				<div className="flex w-full justify-end gap-1.5">
					<Button type="submit" disabled={fetcher.state !== "idle"}>
						{fetcher.state !== "idle" ? "Submitting..." : "Submit"}
					</Button>
				</div>
			</fetcher.Form>
		</>
	);
}

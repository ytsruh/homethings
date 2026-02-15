import { useEffect, useRef } from "react";
import { redirect, useFetcher } from "react-router";
import { ZodError } from "zod";
import PageHeader from "~/components/PageHeader";
import { toast } from "~/components/Toaster";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import type { Route } from "./+types/feedback";

export function meta() {
	return [
		{ title: "Feedback | HomeThings" },
		{ name: "description", content: "Please give your feedback" },
	];
}

export async function clientAction({ request }: Route.ClientActionArgs) {
	// Add fetch request to send feedback to server
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
					<Input name="title" placeholder="Title" />
				</div>
				<div className="grid w-full items-center gap-1.5">
					<Label htmlFor="body">Body</Label>
					<Textarea name="body" placeholder="Body" />
				</div>
				<div className="flex w-full justify-end gap-1.5">
					<Button type="submit">Submit</Button>
				</div>
			</fetcher.Form>
		</>
	);
}

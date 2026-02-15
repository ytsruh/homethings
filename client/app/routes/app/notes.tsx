import { redirect } from "react-router";
import type { Route } from "./+types/notes";

export function meta() {
	return [
		{ title: "Notes | Homethings" },
		{ name: "description", content: "Welcome to Homethings" },
	];
}

export async function clientLoader() {
	return;
}

export default function Notes() {
	return <div>Notes</div>;
}

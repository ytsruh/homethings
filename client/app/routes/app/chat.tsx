import { redirect } from "react-router";
import type { Route } from "./+types/chat";

export function meta() {
	return [
		{ title: "Chat | Homethings" },
		{ name: "description", content: "Welcome to Homethings" },
	];
}

export async function clientLoader() {
	return;
}

export default function Chat() {
	return <div>Chat</div>;
}

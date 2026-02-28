import { redirect } from "react-router";
import type { Route } from "./+types/dashboard";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Dashboard | Homethings" },
		{ name: "description", content: "Welcome to Homethings" },
	];
}

export async function clientLoader({}: Route.ClientLoaderArgs) {
	return;
}

export default function Home() {
	return <div>Hello Homethings</div>;
}

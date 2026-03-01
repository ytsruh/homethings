import { redirect } from "react-router";
import type { Route } from "./+types/dashboard";

export async function clientLoader({}: Route.ClientLoaderArgs) {
	return;
}

export default function Home() {
	return (
		<>
			<title>Dashboard | Homethings</title>
			<meta name="description" content="Welcome to Homethings" />
			<div>Hello Homethings</div>
		</>
	);
}

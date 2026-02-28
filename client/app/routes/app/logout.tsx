import { redirect } from "react-router";
import { logout } from "~/lib/auth";

export async function clientLoader() {
	await logout();
	return redirect("/login");
}

export async function clientAction() {
	await logout();
	return redirect("/login");
}

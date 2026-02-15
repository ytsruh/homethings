import { redirect, useFetcher } from "react-router";
import { ZodError } from "zod";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { toast } from "~/components/Toaster";
import { ThemeProvider } from "~/components/theme-provider";
import { ModeToggle } from "~/components/theme-toggle";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { loginForm } from "~/lib/schema";
import type { Route } from "../+types/login";

export function meta() {
	return [
		{ title: "Login to Homethings" },
		{ name: "description", content: "Login to view awesome things" },
	];
}

export default function Login() {
	const fetcher = useFetcher();

	return (
		<ThemeProvider defaultTheme="dark" storageKey="ui-theme">
			<div className="flex flex-col items-center justify-center h-screen max-h-screen">
				<div className="flex flex-col m-6 space-y-10 shadow-2xl rounded-2xl md:flex-row md:space-y-0 md:m-0 dark:bg-zinc-900">
					<div className="p-6 md:p-20">
						<div className="py-5">
							<h1 className="text-5xl text-center py-2">
								Welcome to <span className="text-theme">Homethings</span>
							</h1>
							<h2 className="text-2xl text-center py-2">
								Login to view awesome things
							</h2>
							<fetcher.Form
								className="flex flex-col gap-y-5 w-full"
								autoComplete="off"
								method="post"
							>
								<div className="flex flex-col">
									<h3 className="py-2">Username</h3>
									<Input placeholder="example@domain.com" name="email" />
								</div>
								<div className="flex flex-col w-full">
									<h3 className="py-2">Password</h3>
									<Input type="password" name="password" />
								</div>
								<div className="flex items-center justify-between w-full gap-x-2">
									<ModeToggle />
									{fetcher.state === "submitting" ? (
										<LoadingSpinner />
									) : (
										<Button type="submit">Login</Button>
									)}
								</div>
							</fetcher.Form>
						</div>
					</div>
					<img
						src={"/img/login.webp"}
						alt=""
						className="w-96 hidden lg:block rounded-r-2xl"
					/>
				</div>
			</div>
		</ThemeProvider>
	);
}

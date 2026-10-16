import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "react-router";
import type { Route } from "./+types/root";
import "./styles.css";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { Toaster } from "~/components/ui/toast";

export const links: Route.LinksFunction = () => [
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
	},
];

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
				/>
				<Meta />
				<Links />
				<link rel="manifest" href="/manifest.json" />
				<link
					rel="apple-touch-icon"
					sizes="180x180"
					href="/apple-touch-icon.png"
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="96x96"
					href="/favicon-96x96.png"
				/>
				<meta
					name="theme-color"
					media="(prefers-color-scheme: light)"
					content="#ffffff"
				/>
				<meta
					name="theme-color"
					media="(prefers-color-scheme: dark)"
					content="#09090b"
				/>
				{/* Blocking theme script: runs before first paint so the statically-served
			    SPA fallback (__spa-fallback.html) and pre-hydration HTML already carry
			    the correct `.dark` class. Without this, the page paints white and only
			    flips to dark later in ThemeProvider's useEffect (white FOUC / spinner
			    flash on /app first load). Logic mirrors ThemeProvider (ui-theme,
			    default dark, system support). */}
				<script
					dangerouslySetInnerHTML={{
						__html: `try{var s=localStorage.getItem("ui-theme")||"dark";var t=s==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):s;var d=document.documentElement;d.classList.remove("light","dark");d.classList.add(t);d.style.colorScheme=t;var m=document.querySelector('meta[name="theme-color"][media="(prefers-color-scheme: dark)"]');if(t==="dark"&&m){m.setAttribute("content","#09090b");}}catch(e){}`,
					}}
				/>
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
				<Toaster />
				<script
					dangerouslySetInnerHTML={{
						__html: `if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js'); }`,
					}}
				/>
			</body>
		</html>
	);
}

export default function App() {
	return <Outlet />;
}

export function HydrateFallback() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background text-foreground">
			<LoadingSpinner />
		</div>
	);
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = "Oops!";
	let details = "An unexpected error occurred.";
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "404" : "Error";
		details =
			error.status === 404
				? "The requested page could not be found."
				: error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className="pt-16 p-4 container mx-auto">
			<h1>{message}</h1>
			<p>{details}</p>
			{stack && (
				<pre className="w-full p-4 overflow-x-auto">
					<code>{stack}</code>
				</pre>
			)}
		</main>
	);
}

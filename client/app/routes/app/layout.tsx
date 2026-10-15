import { useEffect, useRef } from "react";
import {
	Link,
	Outlet,
	redirect,
	useLoaderData,
	useNavigation,
	useRevalidator,
} from "react-router";
import { BreadcrumbNav } from "~/components/BreadcrumbNav";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { menuItems, Navbar } from "~/components/Navbar";
import { ThemeProvider } from "~/components/theme-provider";
import { Separator } from "~/components/ui/separator";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
} from "~/components/ui/sidebar";
import { AuthProvider } from "~/hooks/use-auth";
import {
	AuthHttpError,
	clearCachedUser,
	getCachedUser,
	getCurrentUser,
	setCachedUser,
} from "~/lib/auth";

export async function clientLoader() {
	// Cache-first: a fresh snapshot resolves synchronously so first paint never
	// waits on the network. Stale snapshots also resolve synchronously and are
	// refreshed in the background by AppLayout. Only a definitive 401 clears the
	// cache and redirects; other failures (offline, 5xx) keep stale data.
	const cached = getCachedUser();
	if (cached?.fresh) {
		return { user: cached.user, stale: false };
	}
	try {
		const { user } = await getCurrentUser();
		setCachedUser(user);
		return { user, stale: false };
	} catch (error) {
		if (error instanceof AuthHttpError && error.status === 401) {
			clearCachedUser();
			throw redirect("/login");
		}
		if (cached) {
			return { user: cached.user, stale: true };
		}
		throw redirect("/login");
	}
}

export function HydrateFallback() {
	return (
		<div className="flex min-h-screen flex-col bg-background text-foreground">
			<div className="h-14 border-b border-border" />
			<div className="flex flex-1 items-center justify-center">
				<LoadingSpinner />
			</div>
		</div>
	);
}

export default function AppLayout() {
	const { user, stale } = useLoaderData<typeof clientLoader>();
	const navigation = useNavigation();
	const revalidator = useRevalidator();
	const isNavigating = Boolean(navigation.location);
	// One background refresh per page while the snapshot is stale. Guarded by
	// location key so offline retries can't loop; revalidation never suspends
	// the visible UI.
	const revalidatedFor = useRef<string | null>(null);

	useEffect(() => {
		const key = navigation.location?.key ?? "initial";
		if (stale && revalidatedFor.current !== key && revalidator.state === "idle") {
			revalidatedFor.current = key;
			revalidator.revalidate();
		}
	}, [stale, navigation.location?.key, revalidator]);

	// After sleep or a hidden tab, the snapshot may have expired while away.
	// Refresh on return to foreground instead of on a timer.
	useEffect(() => {
		const onVisible = () => {
			if (document.visibilityState !== "visible") return;
			if (revalidator.state !== "idle") return;
			const cached = getCachedUser();
			if (!cached || !cached.fresh) revalidator.revalidate();
		};
		document.addEventListener("visibilitychange", onVisible);
		return () => document.removeEventListener("visibilitychange", onVisible);
	}, [revalidator]);

	useEffect(() => {
		if (!("ontouchstart" in window)) return;

		const content = document.querySelector(
			"[data-pull-prevent]",
		) as HTMLElement;
		if (!content) return;

		content.style.touchAction = "pan-y";
		content.style.overscrollBehavior = "contain";

		return () => {
			content.style.touchAction = "";
			content.style.overscrollBehavior = "";
		};
	}, []);

	return (
		<ThemeProvider defaultTheme="dark" storageKey="ui-theme">
			<AuthProvider user={user}>
				<SidebarProvider defaultOpen={false}>
					<main className="min-h-screen w-screen overflow-hidden flex flex-col">
						<Navbar user={user} />
						<div className="px-1 sm:px-5 flex flex-col h-full">
							<BreadcrumbNav />
							<div className="hidden md:block">
								<Separator />
							</div>
							<div className="flex h-full">
								<Sidebar
									variant="sidebar"
									collapsible="none"
									className="hidden lg:block bg-transparent"
								>
									<SidebarContent>
										<SidebarGroup>
											<SidebarGroupContent>
												<SidebarMenu>
													<nav className="flex flex-col space-y-3">
														{menuItems.map((item) => {
															return (
																<SidebarMenuItem key={item.title}>
																	<SidebarMenuButton asChild>
																		<Link to={item.url}>
																			<item.icon />
																			<span>{item.title}</span>
																		</Link>
																	</SidebarMenuButton>
																</SidebarMenuItem>
															);
														})}
													</nav>
												</SidebarMenu>
											</SidebarGroupContent>
										</SidebarGroup>
									</SidebarContent>
								</Sidebar>
								<div
									data-pull-prevent
									className="relative p-1 md:p-2 w-full h-full overflow-y-auto"
								>
									{isNavigating && (
										<div
											aria-hidden
											className="pointer-events-none absolute inset-x-0 top-0 z-50 h-0.5 animate-pulse bg-theme"
										/>
									)}
									<Outlet />
								</div>
							</div>
						</div>
					</main>
				</SidebarProvider>
			</AuthProvider>
		</ThemeProvider>
	);
}

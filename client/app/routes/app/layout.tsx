import { useEffect } from "react";
import {
	Link,
	Outlet,
	redirect,
	useLoaderData,
	useNavigation,
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
import { checkAuth } from "~/lib/auth";

export async function clientLoader() {
	const user = await checkAuth();
	if (!user) {
		throw redirect("/login");
	}
	return { user };
}

export default function AppLayout() {
	const { user } = useLoaderData<typeof clientLoader>();
	const navigation = useNavigation();
	const isNavigating = Boolean(navigation.location);

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
									className="p-1 md:p-2 w-full h-full overflow-y-auto"
								>
									{isNavigating ? (
										<div className="flex items-center justify-center h-full">
											<LoadingSpinner />
										</div>
									) : (
										<Outlet />
									)}
								</div>
							</div>
						</div>
					</main>
				</SidebarProvider>
			</AuthProvider>
		</ThemeProvider>
	);
}

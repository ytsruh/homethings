import { useEffect } from "react";
import { Link, Outlet, useNavigation } from "react-router";
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

export default function AppLayout() {
	const navigation = useNavigation();
	const isNavigating = Boolean(navigation.location);

	// Prevent pull-to-refresh on mobile while preserving scrolling in all components
	useEffect(() => {
		// Track touch start position and momentum
		let startY = 0;
		let lastY = 0;
		let lastScrollY = 0;
		let isScrollingUp = false;
		let touchStartTime = 0;
		let lastTouchDirection = 0; // 0 = none, 1 = down, -1 = up

		const handleTouchStart = (e: TouchEvent) => {
			if (e.touches && e.touches.length > 0) {
				startY = e.touches[0].clientY;
				lastY = startY;
				lastScrollY = window.scrollY;
				isScrollingUp = false;
				touchStartTime = Date.now();
				lastTouchDirection = 0;
			}
		};

		const handleTouchMove = (e: TouchEvent) => {
			if (e.touches && e.touches.length === 0) return;

			const currentY = e.touches[0].clientY;
			const deltaY = currentY - startY;
			const movementY = currentY - lastY;
			const currentTime = Date.now();
			const timeDelta = currentTime - touchStartTime;

			// Track touch direction for this movement
			if (movementY > 0) {
				lastTouchDirection = 1; // moving down
			} else if (movementY < 0) {
				lastTouchDirection = -1; // moving up
			}

			// Detect if we're scrolling up
			if (currentY > lastY && window.scrollY < lastScrollY) {
				isScrollingUp = true;
			}

			// Update tracking variables
			lastY = currentY;
			lastScrollY = window.scrollY;

			// Check if we're in a scrollable container
			const target = e.target as HTMLElement;
			let element: HTMLElement | null = target;
			let isInScrollableElement = false;

			// First check if we're in a scrollable element that's not at its boundaries
			while (element && element !== document.body) {
				const style = window.getComputedStyle(element);
				const hasVerticalScroll =
					(style.overflowY === "auto" || style.overflowY === "scroll") &&
					element.scrollHeight > element.clientHeight;

				const hasHorizontalScroll =
					(style.overflowX === "auto" || style.overflowX === "scroll") &&
					element.scrollWidth > element.clientWidth;

				// Calculate how close to the bottom/top we are
				const distanceFromBottom =
					element.scrollHeight - element.scrollTop - element.clientHeight;
				const distanceFromTop = element.scrollTop;
				const isAtBottom = distanceFromBottom < 1;
				const isAtTop = distanceFromTop < 1;

				// More permissive scrolling rules - allow scrolling if:
				// 1. Element has vertical scroll and we're not at the boundary in the direction we're trying to scroll
				// 2. Element has horizontal scroll and there's room to scroll horizontally
				if (
					(hasVerticalScroll && !isAtTop && lastTouchDirection === -1) || // Scrolling up and not at top
					(hasVerticalScroll && !isAtBottom && lastTouchDirection === 1) || // Scrolling down and not at bottom
					(hasVerticalScroll &&
						(distanceFromBottom > 0 || distanceFromTop > 0)) || // Has some room to scroll in either direction
					(hasHorizontalScroll && element.scrollLeft > 0) || // Has room to scroll left
					(hasHorizontalScroll &&
						element.scrollLeft + element.clientWidth < element.scrollWidth) // Has room to scroll right
				) {
					isInScrollableElement = true;
					break;
				}

				element = element.parentElement;
			}

			// If we're in a scrollable element that can handle this scroll, let it
			if (isInScrollableElement) {
				return;
			}

			// Now handle pull-to-refresh prevention
			// Prevent pull-to-refresh in these scenarios:
			// 1. At the top of the page and pulling down
			// 2. Was scrolling up and now at the top and pulling down
			// 3. Quick downward motion at the top (likely a pull-to-refresh gesture)
			if (
				(window.scrollY <= 0 && deltaY > 0) ||
				(isScrollingUp && window.scrollY <= 0 && deltaY > 0) ||
				(window.scrollY <= 0 && deltaY > 30 && timeDelta < 300)
			) {
				// Fast downward swipe
				e.preventDefault();
			}
		};

		// Apply both CSS approaches for better cross-browser compatibility
		document.documentElement.style.overscrollBehavior = "none";
		document.body.style.overscrollBehavior = "none";

		// Add our event listeners
		document.addEventListener("touchstart", handleTouchStart, {
			passive: true,
		});
		document.addEventListener("touchmove", handleTouchMove, { passive: false });

		return () => {
			// Cleanup
			document.documentElement.style.overscrollBehavior = "auto";
			document.body.style.overscrollBehavior = "auto";
			document.removeEventListener("touchstart", handleTouchStart);
			document.removeEventListener("touchmove", handleTouchMove);
		};
	}, []);

	return (
		<ThemeProvider defaultTheme="dark" storageKey="ui-theme">
			<SidebarProvider defaultOpen={false}>
				<main className="h-screen w-screen overflow-hidden flex flex-col">
					<Navbar />
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
							<div className="p-0 md:p-2 w-full h-full">
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
		</ThemeProvider>
	);
}

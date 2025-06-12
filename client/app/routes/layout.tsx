import { Link, Outlet } from "react-router";
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
import { Navbar } from "~/components/Navbar";
import { Separator } from "~/components/ui/separator";
import { BreadcrumbNav } from "~/components/BreadcrumbNav";
import { menuItems } from "~/components/Navbar";
import { useEffect, useState } from "react";
import { type User } from "~/lib/schema";
import { pb } from "~/lib/utils";
import { useNavigate } from "react-router";

export default function AppLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(pb.authStore.record as User | null);

  // If the auth store is invalid, clear it and redirect to logout
  useEffect(() => {
    if (!pb.authStore.isValid) {
      pb.authStore.clear();
      navigate("/logout");
      return;
    }

    // Register a listener for changes to the auth store to update the UI with user preferences
    pb.authStore.onChange(() => {
      setUser(pb.authStore.record as User | null);
    });
  }, [pb.authStore]);

  // Prevent pull-to-refresh on mobile while preserving scrolling in all components
  useEffect(() => {
    // Track touch start position
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        startY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        // Calculate vertical distance moved
        const currentY = e.touches[0].clientY;
        const deltaY = currentY - startY;

        // Only prevent default for the main document body pull-to-refresh
        // Check if we're at the top of the page AND pulling down AND the target element is not a scrollable container
        if (window.scrollY <= 0 && deltaY > 0) {
          const target = e.target as HTMLElement;

          // Check if the touch target or any of its parents is a scrollable element
          let isScrollableElement = false;
          let element: HTMLElement | null = target;

          // Traverse up the DOM to check if we're in a scrollable container
          while (element && element !== document.body) {
            // Check if the element has vertical overflow and is not at the top of its scroll
            const style = window.getComputedStyle(element);
            const hasVerticalScroll =
              (style.overflowY === "auto" || style.overflowY === "scroll") &&
              element.scrollHeight > element.clientHeight;

            // If it's a scrollable element and not at the top, don't prevent default
            if (hasVerticalScroll && element.scrollTop > 0) {
              isScrollableElement = true;
              break;
            }

            // If it's a scrollable element at the top and we're pulling down, prevent default
            if (hasVerticalScroll && element.scrollTop === 0 && deltaY > 0) {
              isScrollableElement = false;
              break;
            }

            element = element.parentElement;
          }

          // Only prevent default if we're not in a scrollable element
          if (!isScrollableElement) {
            e.preventDefault();
          }
        }
      }
    };

    // Apply CSS to prevent overscroll glow/bounce effect but only for the main document
    document.documentElement.style.overscrollBehaviorY = "contain";
    document.body.style.overscrollBehaviorY = "contain";

    // Add event listeners
    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      // Cleanup
      document.documentElement.style.overscrollBehaviorY = "auto";
      document.body.style.overscrollBehaviorY = "auto";
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  return (
    <SidebarProvider defaultOpen={false}>
      <main className="h-screen w-screen overflow-hidden flex flex-col">
        <Navbar user={user as User | null} />
        <div className="px-1 sm:px-5 flex flex-col h-full">
          <BreadcrumbNav />
          <div className="hidden md:block">
            <Separator />
          </div>
          <div className="flex h-full">
            <Sidebar variant="sidebar" collapsible="none" className="hidden lg:block bg-transparent">
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <nav className="flex flex-col space-y-3">
                        {menuItems.map((item) => {
                          if (
                            (item.title === "Notes" && !user?.showNotes) ||
                            (item.title === "Chat" && !user?.showChat) ||
                            (item.title === "Tasks" && !user?.showTasks)
                          ) {
                            return null;
                          }
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
            <div className="p-0 md:p-2 w-full">
              <Outlet />
            </div>
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}

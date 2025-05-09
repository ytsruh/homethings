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
  const [user, setUser] = useState<User | null>(
    pb.authStore.record as User | null
  );

  useEffect(() => {
    // If the auth store is invalid, clear it and redirect to logout
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

  return (
    <SidebarProvider defaultOpen={false}>
      <main className="min-h-screen w-full flex flex-col">
        <Navbar user={user as User | null} />
        <div className="px-1 sm:px-5 flex flex-col h-full">
          <BreadcrumbNav />
          <Separator />
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

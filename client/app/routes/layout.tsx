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

export default function AppLayout() {
  return (
    <SidebarProvider defaultOpen={false}>
      <main className="min-h-screen w-full flex flex-col">
        <Navbar />
        <div className="px-5 flex flex-col h-full">
          <BreadcrumbNav />
          <Separator />
          <div className="flex h-full">
            <Sidebar variant="sidebar" collapsible="none" className="hidden lg:block bg-transparent">
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <nav className="flex flex-col space-y-3">
                        {menuItems.map((item) => (
                          <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild>
                              <Link to={item.url}>
                                <item.icon />
                                <span>{item.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </nav>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
            </Sidebar>
            <div className="p-2 w-full">
              <Outlet />
            </div>
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}

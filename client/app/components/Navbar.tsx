import { Home, House, Bot, NotebookPen, Menu, User, X, BookOpenText, ListTodo } from "lucide-react";
import { Link } from "react-router";
import { useEffect, useRef } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar";
import { ModeToggle } from "~/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

export function Navbar() {
  const { toggleSidebar } = useSidebar();

  return (
    <>
      <AppSidebar />
      <div className="flex h-16 items-center px-6">
        <Menu onClick={toggleSidebar} className="h-[1.4rem] w-[1.4rem] lg:hidden cursor-pointer" />
        <Link className="text-theme justify-center items-center gap-2 hidden lg:flex" to="/">
          <House className="h-[1.4rem] w-[1.4rem]" />
          <p>Homethings</p>
        </Link>
        <div className="ml-auto flex items-center space-x-4">
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="hover:cursor-pointer">
              <Avatar>
                <AvatarImage src="https://avatar.iran.liara.run/public" alt="@shadcn" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[12rem]">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Example Name</p>
                  <p className="text-xs leading-none text-muted-foreground">example@example.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link to="/profile">
                <DropdownMenuItem className="hover:cursor-pointer">Profile</DropdownMenuItem>
              </Link>
              <Link to="/feedback">
                <DropdownMenuItem className="hover:cursor-pointer">Feedback</DropdownMenuItem>
              </Link>
              <Link to="/logout">
                <DropdownMenuItem className="hover:cursor-pointer">Logout</DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  );
}

// Menu items.
export const menuItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Chat",
    url: "/chat",
    icon: Bot,
  },
  {
    title: "Tasks",
    url: "/tasks",
    icon: ListTodo,
  },
  {
    title: "Notes",
    url: "/notes",
    icon: NotebookPen,
  },
  {
    title: "Books",
    url: "/books",
    icon: BookOpenText,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
];

function AppSidebar() {
  const { toggleSidebar, setOpen } = useSidebar();
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setOpen]);

  return (
    <Sidebar ref={sidebarRef} variant="floating" collapsible="offcanvas">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex justify-end">
            <X onClick={toggleSidebar} className="h-[1.4rem] w-[1.4rem] cursor-pointer hover:text-theme" />
          </SidebarGroupLabel>
          <SidebarHeader>
            <h1>What do you want to do?</h1>
          </SidebarHeader>
          <SidebarGroupContent>
            <SidebarMenu>
              <nav className="my-5 flex flex-col space-y-3">
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
  );
}

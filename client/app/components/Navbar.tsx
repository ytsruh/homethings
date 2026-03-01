import {
	Bot,
	Folder,
	Home,
	House,
	Image,
	Menu,
	NotebookPen,
	User as UserIcon,
	X,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router";
import { ModeToggle } from "~/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
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
import type { User } from "~/lib/auth";

interface NavbarProps {
	user: User;
}

function getPageTitle(pathname: string): string {
	const path = pathname.replace(/^\/+/, "").split("/");
	const segment = path[1] || path[0];

	const titleMap: Record<string, string> = {
		app: "Dashboard",
		chat: "Chat",
		images: "Images",
		notes: "Notes",
		profile: "Profile",
		feedback: "Feedback",
	};

	return titleMap[segment] || "Dashboard";
}

export function Navbar({ user }: NavbarProps) {
	const { toggleSidebar } = useSidebar();
	const location = useLocation();
	return (
		<>
			<AppSidebar />
			<div className="flex min-h-12 md:min-h-16 items-center px-4 md:px-6 py-0 md:py-1">
				<Menu
					onClick={toggleSidebar}
					className="h-[1.4rem] w-[1.4rem] lg:hidden cursor-pointer"
				/>
				<Link
					className="text-theme justify-center items-center gap-2 hidden lg:flex"
					to="/app"
				>
					<House className="h-[1.4rem] w-[1.4rem]" />
					<p>Homethings</p>
				</Link>
				<div className="text-theme capitalize justify-center items-center gap-2 flex lg:hidden mx-1">
					{getPageTitle(location.pathname)}
				</div>
				<div className="ml-auto flex items-center space-x-4">
					<ModeToggle />
					<DropdownMenu>
						<DropdownMenuTrigger asChild className="hover:cursor-pointer">
							<Avatar>
								<AvatarImage alt={user.name} />
								<AvatarFallback>
									{user.name
										.split(" ")
										.map((n) => n[0])
										.join("")
										.toUpperCase()
										.slice(0, 2)}
								</AvatarFallback>
							</Avatar>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="min-w-[12rem]">
							<DropdownMenuLabel>
								<div className="flex flex-col space-y-1">
									<p className="text-sm font-medium leading-none">
										{user.name}
									</p>
									<p className="text-xs leading-none text-muted-foreground">
										{user.email}
									</p>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<Link to="/app/profile">
								<DropdownMenuItem className="hover:cursor-pointer">
									Profile
								</DropdownMenuItem>
							</Link>
							<Link to="/app/feedback">
								<DropdownMenuItem className="hover:cursor-pointer">
									Feedback
								</DropdownMenuItem>
							</Link>
							<Link to="/app/logout">
								<DropdownMenuItem className="hover:cursor-pointer">
									Logout
								</DropdownMenuItem>
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
		title: "Dashboard",
		url: "/app",
		icon: Home,
	},
	{
		title: "Chat",
		url: "/app/chat",
		icon: Bot,
	},
	{
		title: "Images",
		url: "/app/images",
		icon: Image,
	},
	{
		title: "Files",
		url: "/app/files",
		icon: Folder,
	},
	{
		title: "Notes",
		url: "/app/notes",
		icon: NotebookPen,
	},
	{
		title: "Profile",
		url: "/app/profile",
		icon: UserIcon,
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
			if (
				sidebarRef.current &&
				!sidebarRef.current.contains(event.target as Node)
			) {
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
						<X
							onClick={toggleSidebar}
							className="h-[1.4rem] w-[1.4rem] cursor-pointer hover:text-theme"
						/>
					</SidebarGroupLabel>
					<SidebarHeader>
						<h1>What do you want to do?</h1>
					</SidebarHeader>
					<SidebarGroupContent>
						<SidebarMenu>
							<nav className="my-5 flex flex-col space-y-3">
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
	);
}

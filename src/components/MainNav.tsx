import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/components/Auth";
import { HomeIcon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import { AppPreferences } from "@/types";

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]);
}

type MainNavProps = {
  preferences: AppPreferences;
};

export default function MainNav(props: MainNavProps) {
  const preferences = props.preferences;
  const { signOut } = useAuth();

  return (
    <div className="border-b">
      <Sheet>
        <div className="flex h-16 items-center px-6">
          <a className="text-accent flex justify-center items-center gap-2" href="/">
            <HomeIcon className="hidden lg:block h-[1.4rem] w-[1.4rem]" />
            <p className="hidden lg:block">Homethings</p>
          </a>
          <SheetTrigger>
            <HamburgerMenuIcon className="h-[1.4rem] w-[1.4rem] lg:hidden cursor-pointer" />
          </SheetTrigger>
          <div className="ml-auto flex items-center space-x-4">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={preferences.profileImage} alt="User" />
                    <AvatarFallback>{preferences.name ? getInitials(preferences.name) : "--"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {preferences.name ? preferences.name : <span className="italic">User Name</span>}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {preferences.email ? preferences.email : ""}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <a href="/profile">
                    <DropdownMenuItem className="hover:cursor-pointer">Profile</DropdownMenuItem>
                  </a>
                  <a href="/feedback">
                    <DropdownMenuItem className="hover:cursor-pointer">Feedback</DropdownMenuItem>
                  </a>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="hover:cursor-pointer" onClick={() => signOut()}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>What do you want to do?</SheetTitle>
            <SheetDescription></SheetDescription>
            <nav className="py-10 flex flex-col space-y-2">
              <a href="/" className="text-sm  hover:text-accent dark:text-white dark:hover:text-accent">
                Home
              </a>
              {preferences.showChat && (
                <a href="/chat" className="text-sm  hover:text-accent dark:text-white dark:hover:text-accent">
                  Chat
                </a>
              )}
              {preferences.showNotes && (
                <a href="/notes" className="text-sm hover:text-accent dark:text-white dark:hover:text-accent">
                  Notes
                </a>
              )}
              {preferences.showDocuments && (
                <a
                  href="/documents"
                  className="text-sm hover:text-accent dark:text-white dark:hover:text-accent">
                  Documents
                </a>
              )}
              {preferences.showBooks && (
                <a href="/books" className="text-sm hover:text-accent dark:text-white dark:hover:text-accent">
                  Books
                </a>
              )}
              {preferences.showWealth && (
                <a
                  href="/wealth"
                  className="text-sm hover:text-accent dark:text-white dark:hover:text-accent">
                  Wealth
                </a>
              )}
              <a href="/profile" className="text-sm hover:text-accent dark:text-white dark:hover:text-accent">
                Profile
              </a>
            </nav>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
}

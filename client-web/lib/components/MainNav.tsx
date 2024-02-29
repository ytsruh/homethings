"use client";
import React from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "./ui/button";
import { ToggleTheme } from "./ToggleTheme";
import { HomeIcon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import { removeLocalToken, removeLocalUser } from "../utils";
import { useRouter } from "next/navigation";

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]);
}

export default function MainNav(props: any) {
  const router = useRouter();
  const { preferences } = props;

  function handleLogout() {
    removeLocalUser();
    removeLocalToken();
    router.push("/login");
  }

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
            <ToggleTheme />
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
                      {preferences.name ? preferences.name : <span className="italic">Name</span>}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {preferences.email ? preferences.email : ""}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <a href="/app/profile">
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                  </a>
                  <a href="/app/feedback">
                    <DropdownMenuItem>Feedback</DropdownMenuItem>
                  </a>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>What do you want to do?</SheetTitle>
            <div className="py-2">
              <div className="mt-5 flex flex-col space-y-5">
                <Link href="/app" className="text-sm font-medium transition-colors hover:text-primary">
                  Home
                </Link>
                {preferences.showDocuments && (
                  <Link
                    href="/app/documents"
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                    Documents
                  </Link>
                )}
                {preferences.showBooks && (
                  <Link
                    href="/app/books"
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                    Books
                  </Link>
                )}
              </div>
            </div>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
}

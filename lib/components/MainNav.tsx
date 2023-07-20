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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { signOut } from "next-auth/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "./ui/button";
import { ToggleTheme } from "./ToggleTheme";
import { HomeIcon, HamburgerMenuIcon } from "@radix-ui/react-icons";

export default function MainNav() {
  return (
    <div className="border-b">
      <Sheet>
        <div className="flex h-16 items-center px-6">
          <a className="text-accent" href="/">
            <HomeIcon className="hidden lg:block h-[1.4rem] w-[1.4rem]" />
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
                    <AvatarImage src="/avatars/01.png" alt="User" />
                    <AvatarFallback>AA</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">username</p>
                    <p className="text-xs leading-none text-muted-foreground">user@example.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <a href="/profile">
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                  </a>
                  <a href="/feedback">
                    <DropdownMenuItem>Feedback</DropdownMenuItem>
                  </a>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>What do you want to do?</SheetTitle>
            <SheetDescription>
              <nav className="mt-5 flex flex-col space-y-5">
                <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
                  Home
                </Link>
                <Link
                  href="/documents"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  Documents
                </Link>
                <Link
                  href="/books"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  Books
                </Link>
              </nav>
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
}

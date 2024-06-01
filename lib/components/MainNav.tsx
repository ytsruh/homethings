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
import { lucia, validateRequest } from "@/lib/auth";
import { Form } from "@/lib/form";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import type { ActionResult } from "@/lib/form";

export default function MainNav() {
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
                    <AvatarImage src="" alt="User" />
                    <AvatarFallback>--</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      <span className="italic">Name</span>
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">""</p>
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
                <Form action={logout}>
                  <button className="w-full">
                    <DropdownMenuItem>Logout</DropdownMenuItem>
                  </button>
                </Form>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>What do you want to do?</SheetTitle>
            <nav className="py-10 flex flex-col space-y-5">
              <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
                Home
              </Link>
              <Link href="/chat" className="text-sm font-medium transition-colors hover:text-primary">
                Chat
              </Link>
              <Link href="/notes" className="text-sm font-medium transition-colors hover:text-primary">
                Notes
              </Link>
              <Link
                href="/documents"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                Documents
              </Link>
              <Link
                href="/books"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                Books
              </Link>
            </nav>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
}

async function logout(): Promise<ActionResult> {
  "use server";
  console.log("logout");
  const { session } = await validateRequest();
  if (!session) {
    return {
      error: "Unauthorized",
    };
  }

  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  return redirect("/login");
}

<script lang="ts">
  import House from "lucide-svelte/icons/house";
  import MenuIcon from "lucide-svelte/icons/menu";
  import * as Sheet from "$lib/components/ui/sheet/index.js";
  import DarkModeToggle from "./DarkModeToggle.svelte";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import * as Avatar from "$lib/components/ui/avatar/index.js";
</script>

<div class="border-b">
  <div class="flex h-16 items-center px-6">
    <Sheet.Root>
      <Sheet.Trigger>
        <MenuIcon class="h-[1.4rem] w-[1.4rem] lg:hidden cursor-pointer" />
      </Sheet.Trigger>
      <a class="text-theme justify-center items-center gap-2 hidden lg:flex" href="/">
        <House class="h-[1.4rem] w-[1.4rem]" />
        <p>Homethings</p>
      </a>
      <div class="ml-auto flex items-center space-x-4">
        <DarkModeToggle />
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Avatar.Root>
              <Avatar.Image src="https://github.com/shadcn.png" alt="@shadcn" />
              <Avatar.Fallback>CN</Avatar.Fallback>
            </Avatar.Root>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end" class="min-w-[12rem]">
            <DropdownMenu.Group>
              <DropdownMenu.GroupHeading>
                <div class="flex flex-col space-y-1">
                  <p class="text-sm font-medium leading-none">User Name</p>
                  <p class="text-xs leading-none text-muted-foreground">email@email.com</p>
                </div>
              </DropdownMenu.GroupHeading>
              <DropdownMenu.Separator />
              <a href="/profile">
                <DropdownMenu.Item class="hover:cursor-pointer">Profile</DropdownMenu.Item>
              </a>
              <a href="/feedback">
                <DropdownMenu.Item class="hover:cursor-pointer">Feedback</DropdownMenu.Item>
              </a>
              <a href="/logout">
                <DropdownMenu.Item class="hover:cursor-pointer">Logout</DropdownMenu.Item>
              </a>
            </DropdownMenu.Group>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
      <Sheet.Content side="left">
        <Sheet.Header>
          <Sheet.Title>What do you want to do?</Sheet.Title>
          <nav class="py-10 flex flex-col space-y-4">
            <a href="/" class="text-sm hover:text-accent dark:text-white dark:hover:text-accent"> Home </a>
            <a href="/chat" class="text-sm hover:text-accent dark:text-white dark:hover:text-accent">
              Chat
            </a>
            <a href="/notes" class="text-sm hover:text-accent dark:text-white dark:hover:text-accent">
              Notes
            </a>
            <a href="/documents" class="text-sm hover:text-accent dark:text-white dark:hover:text-accent">
              Documents
            </a>
            <a href="/books" class="text-sm hover:text-accent dark:text-white dark:hover:text-accent">
              Books
            </a>
            <a href="/profile" class="text-sm hover:text-accent dark:text-white dark:hover:text-accent">
              Profile
            </a>
          </nav>
        </Sheet.Header>
      </Sheet.Content>
    </Sheet.Root>
  </div>
</div>

<script lang="ts">
  import House from "lucide-svelte/icons/house";
  import MenuIcon from "lucide-svelte/icons/menu";
  import * as Sheet from "$lib/components/ui/sheet/index.js";
  import DarkModeToggle from "./DarkModeToggle.svelte";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  export let user;
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
              <Avatar.Image src={user.profileImage} alt={user.name || "User Profile"} />
              <Avatar.Fallback>{user.name?.charAt(0) || "??"}</Avatar.Fallback>
            </Avatar.Root>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end" class="min-w-[12rem]">
            <DropdownMenu.Group>
              <DropdownMenu.GroupHeading>
                <div class="flex flex-col space-y-1">
                  <p class="text-sm font-medium leading-none">{user.name || "--"}</p>
                  <p class="text-xs leading-none text-muted-foreground">{user.email || ""}</p>
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
            <a href="/" class="text-sm hover:text-theme dark:text-white dark:hover:text-theme"> Home </a>
            {#if user.showChat}
              <a href="/chat" class="text-sm hover:text-theme dark:text-white dark:hover:text-theme">
                Chat
              </a>
            {/if}
            {#if user.showNotes}
              <a href="/notes" class="text-sm hover:text-theme dark:text-white dark:hover:text-theme">
                Notes
              </a>
            {/if}
            {#if user.showDocuments}
              <a href="/documents" class="text-sm hover:text-theme dark:text-white dark:hover:text-theme">
                Documents
              </a>
            {/if}
            {#if user.showBooks}
              <a href="/books" class="text-sm hover:text-theme dark:text-white dark:hover:text-theme">
                Books
              </a>
            {/if}
            <a href="/profile" class="text-sm hover:text-theme dark:text-white dark:hover:text-theme">
              Profile
            </a>
          </nav>
        </Sheet.Header>
      </Sheet.Content>
    </Sheet.Root>
  </div>
</div>

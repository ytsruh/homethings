<script lang="ts">
  import NavBar from "@/lib/components/NavBar.svelte";
  import BreadcrumbNavigation from "@/lib/components/BreadcrumbNav.svelte";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import { Toaster } from "$lib/components/ui/sonner/index.js";
  import { navigating } from "$app/stores";
  import Loading from "@/lib/components/Loading.svelte";
  import type { PageServerData } from "./$types";
  let { children, data }: { children: any; data: PageServerData } = $props();
  let user = $state(data.user);
</script>

<div class="min-h-screen flex flex-col">
  <NavBar {user} />
  <div class="px-5 py-2 flex flex-col h-full">
    <BreadcrumbNavigation />
    <Separator />
    <div class="flex">
      <div class="hidden lg:flex lg:flex-col lg:p-2 lg:w-56 lg:space-y-3">
        <a
          class="hover:bg-zinc-800 text-sm rounded-md px-2 py-2 hover:cursor-pointer hover:text-white"
          href="/"
        >
          Home
        </a>
        {#if user.showChat}
          <a
            class="hover:bg-zinc-800 text-sm rounded-md px-2 py-2 hover:cursor-pointer hover:text-white"
            href="/chat"
          >
            Chat
          </a>
        {/if}
        {#if user.showTasks}
          <a
            class="hover:bg-zinc-800 text-sm rounded-md px-2 py-2 hover:cursor-pointer hover:text-white"
            href="/tasks"
          >
            Tasks
          </a>
        {/if}
        {#if user.showNotes}
          <a
            class="hover:bg-zinc-800 text-sm rounded-md px-2 py-2 hover:cursor-pointer hover:text-white"
            href="/notes"
          >
            Notes
          </a>
        {/if}
        {#if user.showDocuments}
          <a
            class="hover:bg-zinc-800 text-sm rounded-md px-2 py-2 hover:cursor-pointer hover:text-white"
            href="/documents"
          >
            Documents
          </a>
        {/if}
        {#if user.showBooks}
          <a
            class="hover:bg-zinc-800 text-sm rounded-md px-2 py-2 hover:cursor-pointer hover:text-white"
            href="/books"
          >
            Books
          </a>
        {/if}
        {#if user.showWealth}
          <a
            class="hover:bg-zinc-800 text-sm rounded-md px-2 py-2 hover:cursor-pointer hover:text-white"
            href="/wealth"
          >
            Wealth
          </a>
        {/if}
        <a
          class="hover:bg-zinc-800 text-sm rounded-md px-2 py-2 hover:cursor-pointer hover:text-white"
          href="/profile"
        >
          Profile
        </a>
      </div>
      <div class="p-2 w-full">
        {#if $navigating}
          <Loading />
        {:else}
          {@render children()}
        {/if}
      </div>
    </div>
  </div>
  <Toaster />
</div>

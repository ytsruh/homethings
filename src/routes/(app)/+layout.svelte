<script lang="ts">
  import NavBar from "@/lib/components/NavBar.svelte";
  import BreadcrumbNavigation from "@/lib/components/BreadcrumbNav.svelte";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import { Toaster } from "$lib/components/ui/sonner/index.js";
  import { navigating } from '$app/stores';
  import Loading from "@/lib/components/Loading.svelte";
  let { children } = $props();
  const links = [
    { text: "Home", link: "/" },
    { text: "Chat", link: "/chat" },
    { text: "Notes", link: "/notes" },
    { text: "Documents", link: "/documents" },
    { text: "Books", link: "/books" },
    { text: "Profile", link: "/profile" },
  ];
</script>

<div class="min-h-screen flex flex-col">
    <NavBar />
    <div class="px-5 py-2 flex flex-col h-full">
    <BreadcrumbNavigation />
    <Separator />
    <div class="flex">
        <div class="hidden lg:flex lg:flex-col lg:p-2 lg:w-56 lg:space-y-3">
          {#each links as link}
              <a class="hover:bg-zinc-800 text-sm rounded-md px-2 py-2 hover:cursor-pointer hover:text-white"
              href={link.link}>
                  {link.text}
              </a>
          {/each}
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
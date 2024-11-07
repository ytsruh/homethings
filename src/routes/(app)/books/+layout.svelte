<script lang="ts">
  import PageHeader from "@/lib/components/PageHeader.svelte";
  import * as Menubar from "$lib/components/ui/menubar";
  import type { PageServerData } from "./$types";
  import { navigating } from "$app/stores";
  import Loading from "@/lib/components/Loading.svelte";
  import Separator from "@/lib/components/ui/separator/separator.svelte";

  let { children, data }: { children: any; data: PageServerData } = $props();
</script>

<svelte:head>
  <title>Books | Homethings</title>
  <meta name="description" content="Your book collection" />
</svelte:head>

<PageHeader title="Books" subtitle="Your book collection" />
<div class="w-max">
  <Menubar.Root>
    <Menubar.Menu>
      <a href="/books">
        <Menubar.Trigger>Home</Menubar.Trigger>
      </a>
    </Menubar.Menu>
    <Menubar.Menu>
      <Menubar.Trigger>Manage</Menubar.Trigger>
      <Menubar.Content>
        <a href="/books/add">
          <Menubar.Item class="hover:cursor-pointer">Add</Menubar.Item>
        </a>
        <a href="/books/search">
          <Menubar.Item class="hover:cursor-pointer">Search</Menubar.Item>
        </a>
      </Menubar.Content>
    </Menubar.Menu>
    <Menubar.Menu>
      <Menubar.Trigger>Views</Menubar.Trigger>
      <Menubar.Content>
        <a href="/books/wishlist">
          <Menubar.Item class="hover:cursor-pointer">Wishlist</Menubar.Item>
        </a>
        <a href="/books/read">
          <Menubar.Item class="hover:cursor-pointer">Read</Menubar.Item>
        </a>
        <a href="/books/unread">
          <Menubar.Item class="hover:cursor-pointer">Unread</Menubar.Item>
        </a>
      </Menubar.Content>
    </Menubar.Menu>
  </Menubar.Root>
</div>
<Separator class="my-5" />
<div class="py-2 w-full">
  {#if $navigating}
    <Loading />
  {:else}
    {@render children()}
  {/if}
</div>

<script lang="ts">
  import Ellipsis from "lucide-svelte/icons/ellipsis";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import type { SelectDocument } from "@/server/db/schema";
  import DeleteModal from "./DeleteModal.svelte";

  let { data }: { data: SelectDocument } = $props();
  async function download(filename: string) {
    const response = await fetch(`/api/documents/url?fileName=${filename}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to get S3 url");
    }
    const res: { url: string } = await response.json();
    window.open(res.url, "_blank", "noreferrer");
  }
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <Button
        {...props}
        variant="ghost"
        size="icon"
        class="relative size-8 p-0"
      >
        <span class="sr-only">Open menu</span>
        <Ellipsis class="size-4" />
      </Button>
    {/snippet}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content align="end" class="flex flex-col gap-1">
    <DropdownMenu.Item
      onclick={() => download(data.fileName as string)}
      class="hover:cursor-pointer"
    >
      Download
    </DropdownMenu.Item>
    <a href={`/documents/${data.id}`}>
      <DropdownMenu.Item class="hover:cursor-pointer">Edit</DropdownMenu.Item>
    </a>
    <DeleteModal id={data.id} />
  </DropdownMenu.Content>
</DropdownMenu.Root>

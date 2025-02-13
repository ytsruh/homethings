<script lang="ts" module>
  type TData = unknown;
</script>

<script lang="ts" generics="TData">
  import Ellipsis from "lucide-svelte/icons/ellipsis";
  import type { Row } from "@tanstack/table-core";
  import { taskSchema } from "../(data)/schemas.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import Button from "$lib/components/ui/button/button.svelte";

  let { row }: { row: Row<TData> } = $props();

  const task = taskSchema.parse(row.original);
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <Button
        {...props}
        variant="ghost"
        class="data-[state=open]:bg-muted flex h-8 w-8 p-0"
      >
        <Ellipsis />
        <span class="sr-only">Open Menu</span>
      </Button>
    {/snippet}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content class="w-[160px]" align="end">
    <DropdownMenu.Item>Edit</DropdownMenu.Item>
    <DropdownMenu.Item>Mark as complete</DropdownMenu.Item>
    <DropdownMenu.Separator />
    <DropdownMenu.Item>Delete</DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>

<script lang="ts">
  import PageHeader from "@/lib/components/PageHeader.svelte";
  import NoteCard from "./NoteCard.svelte";
  import CreateModal from "./CreateModal.svelte";
  import { Input } from "@/lib/components/ui/input";
  import type { PageData } from "./$types";
  import type { SelectNote } from "$lib/server/db/schema";

  let { data }: { data: PageData } = $props();
  let search: string = $state("");
  let notes: SelectNote[] = $derived.by(() => {
    if (!search) {
      return data.notes;
    }
    if (data.notes.length === 0) {
      return [];
    }
    return data.notes.filter((note) => {
      return note.title?.toLowerCase().includes(search.toLowerCase());
    });
  });
</script>

<svelte:head>
  <title>Notes | Homethings</title>
  <meta name="description" content="A personal space to jot down your thoughts" />
</svelte:head>

<PageHeader title="Notes" subtitle="A personal space to jot down your thoughts" />

<div class="w-full flex justify-between items-center gap-5 py-5">
  <Input placeholder="Filter notes..." bind:value={search} />
  <CreateModal data={data.form} />
</div>
{#if notes?.length === 0}
  <div class="w-full text-center py-5">
    <h2>No notes have been created</h2>
  </div>
{:else}
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
    {#each notes as note}
      <NoteCard data={note} />
    {/each}
  </div>
{/if}

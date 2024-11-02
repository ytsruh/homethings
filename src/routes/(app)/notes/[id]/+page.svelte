<script lang="ts">
  import ArrowLeft from "lucide-svelte/icons/arrow-left";
  import DeleteModal from "./DeleteModal.svelte";
  import UpdateForm from "./UpdateForm.svelte";
  import type { PageData } from "./$types";
  import { buttonVariants } from "@/lib/components/ui/button";

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Notes | Homethings</title>
  <meta name="description" content="A personal space to jot down your thoughts" />
</svelte:head>

{#if data.note.length === 0}
  <div class="w-full flex justify-start items-cemter py-2">
    <a href={`/notes`} class={buttonVariants({ variant: "secondary", size: "sm" })}>
      <ArrowLeft class="mr-2 h-4 w-4" />
      Back
    </a>
  </div>
  <div class="w-full text-center py-5">
    <h1 class="text-xl text-theme">Note not found</h1>
  </div>
{:else}
  <div class="flex justify-between items py-2">
    <a href={`/notes`} class={buttonVariants({ variant: "secondary", size: "sm" })}>
      <ArrowLeft class="mr-2 h-4 w-4" />
      Back
    </a>
    <DeleteModal id={data.note[0].id} />
  </div>
  <div class="w-full flex justify-center py-5">
    <UpdateForm data={data.form} />
  </div>
{/if}

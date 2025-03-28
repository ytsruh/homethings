<script lang="ts">
  import ArrowLeft from "lucide-svelte/icons/arrow-left";
  import type { PageData } from "./$types";
  import { buttonVariants } from "@/lib/components/ui/button";
  import UpdateForm from "./UpdateForm.svelte";

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Documents | Homethings</title>
  <meta
    name="description"
    content="Document storage shared across your account"
  />
</svelte:head>

{#if data.note.length === 0}
  <div class="w-full flex justify-start items-cemter py-2">
    <a
      href={`/documents`}
      class={buttonVariants({ variant: "secondary", size: "sm" })}
    >
      <ArrowLeft class="mr-2 h-4 w-4" />
      Back
    </a>
  </div>
  <div class="w-full text-center py-5">
    <h1 class="text-xl text-theme">Document not found</h1>
  </div>
{:else}
  <div class="w-full flex justify-center py-2">
    <UpdateForm data={data.form} />
  </div>
{/if}

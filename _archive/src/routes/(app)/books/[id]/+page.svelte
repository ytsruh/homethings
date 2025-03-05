<script lang="ts">
  import type { PageData } from "./$types";
  import UpdateForm from "./UpdateForm.svelte";
  let { data }: { data: PageData } = $props();
</script>

{#if data.books.length === 0}
  <div class="w-full text-center py-5">
    <h2 class="text-lg">Book not found</h2>
  </div>
{:else}
  <div class="py-5 flex w-full">
    <img
      src={data.books[0].image as string}
      alt={data.books[0].name as string}
      class="lg:basis-1/4 hidden lg:block"
    />
    <div class="basis-full lg:basis-3/4 flex justify-center px-2">
      <UpdateForm data={data.form} id={data.books[0].id} />
    </div>
  </div>
{/if}

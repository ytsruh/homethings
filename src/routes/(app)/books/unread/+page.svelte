<script lang="ts">
  import type { PageData } from "./$types";
  import BookItem from "../BookItem.svelte";

  let { data }: { data: PageData } = $props();
</script>

<div class="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 py-5">
  {#if data.books.length > 0}
    {#each data.books as book}
      {#if book.read === false}
        <BookItem data={book} />
      {/if}
    {/each}
  {:else}
    <div class="w-full text-center py-5">
      <h2>You have no unread books</h2>
    </div>
  {/if}
</div>

<script lang="ts">
  import { Input } from "@/lib/components/ui/input";
  import { Button } from "@/lib/components/ui/button";
  import type { PageData } from "./$types";
  import { enhance } from "$app/forms";
  import { createBookFormSchema } from "@/lib/schema";
  import { toast } from "svelte-sonner";
  import { goto } from "$app/navigation";

  let { data }: { data: PageData } = $props();
  let searchisbn: string = $state("");
  let result: any = $state(null);
  let searching: boolean = $state(false);
  let error: boolean = $state(false);

  function clear() {
    searchisbn = "";
    result = null;
    searching = false;
    error = false;
  }

  async function search() {
    if (!searchisbn) {
      error = true;
      return;
    }
    try {
      searching = true;
      const response = await fetch(
        `https://openlibrary.org/isbn/${searchisbn.trim()}.json`,
      );
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("No books found");
        }
        throw new Error("Something went wrong");
      }
      const res = await response.json();
      console.log(res);

      result = res;
      searching = false;
    } catch (err) {
      console.log(err);
      result = null;
      searching = false;
      error = true;
    }
  }
</script>

<div class="w-full flex justify-between items-center gap-x-5">
  <Input
    class="my-2"
    type="text"
    placeholder="Search OpenBooks database by ISBN"
    name="search"
    bind:value={searchisbn}
  />
  <Button onclick={() => search()}>Search</Button>
  <Button variant="secondary" onclick={() => clear()}>Clear</Button>
</div>

{#if searching}
  <div class="w-full text-center py-5">
    <h2 class="text-lg">Searching...</h2>
  </div>
{/if}

{#if result}
  <div class="py-5 flex w-full justify-center items-center">
    <img
      src={`https://covers.openlibrary.org/b/isbn/${searchisbn}-M.jpg`}
      alt={result.title}
      class="hidden sm:block basis-1/4 h-72"
    />
    <div class="basis-3/4 flex flex-col md:flex-row justify-center px-2">
      <div
        class="basis-full md:basis-3/4 text-center md:text-left flex flex-col justify-center items-center gap-2 px-2 lg:px-5"
      >
        <div class="w-full">
          <span class="text-xl">Title / Name :</span>
          {result.title}
          <input type="text" class="hidden" value={result.title} name="name" />
        </div>
        <div class="w-full">
          <span class="text-xl">Author :</span>
          {result.by_statement}
          <input
            type="text"
            class="hidden"
            value={result.by_statement}
            name="author"
          />
        </div>
        <div class="w-full">
          <span class="text-xl">ISBN :</span>
          {result["isbn_13"]}
          <input
            type="text"
            class="hidden"
            value={result["isbn_13"]}
            name="isbn"
          />
        </div>
      </div>
      <div
        class="basis-full md:basis-1/4 flex justify-center items-center py-5"
      >
        <form
          method="POST"
          use:enhance={() => {
            return async ({ result, update }) => {
              if (result.type === "success") {
                toast.success("Book successfully added.");
                return goto(`/books`, { invalidateAll: true });
              }
              if (result.type === "failure") {
                toast.error("Something went wrong. Please try again.");
              }
            };
          }}
        >
          <input type="text" name="name" class="hidden" value={result.title} />
          <input
            type="text"
            name="author"
            class="hidden"
            value={result.by_statement}
          />
          <input
            type="text"
            name="isbn"
            class="hidden"
            value={result["isbn_13"]}
          />
          <input
            type="text"
            name="image"
            class="hidden"
            value={`https://covers.openlibrary.org/b/isbn/${searchisbn}-M.jpg`}
          />
          <Button type="submit">Add to Library</Button>
        </form>
      </div>
    </div>
  </div>
{:else if error && !searching}
  <div class="w-full text-center py-5">
    <h2 class="text-lg">No books found</h2>
  </div>
{/if}

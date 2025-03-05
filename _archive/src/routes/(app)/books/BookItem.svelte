<script lang="ts">
  import type { SelectBook } from "@/server/db/schema";
  let { data }: { data: SelectBook } = $props();
</script>

<a
  href={`/books/${data.id}`}
  class="p-2 hover:border-zinc-500 hover:border hover:rounded-lg"
>
  <img
    class="object-contain h-64 w-full"
    src={data.image || "https://fakeimg.pl/72x128?text=?&font=noto"}
    alt={data.name as string}
  />
</a>

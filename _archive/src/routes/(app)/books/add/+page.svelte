<script lang="ts">
  import CreateForm from "./CreateForm.svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
</script>

<div class="w-full flex flex-col items-center justify-center">
  <CreateForm data={data.form} />
</div>

<script lang="ts">
  import { Badge } from "$lib/components/ui/badge/index.js";
  let { labels }: { labels?: string[] } = $props();
</script>

<div class="flex space-x-2">
  {#if labels}
    {#each labels as label}
      <Badge variant="outline">{label}</Badge>
    {/each}
  {:else}
    <Badge variant="outline">General</Badge>
  {/if}
</div>

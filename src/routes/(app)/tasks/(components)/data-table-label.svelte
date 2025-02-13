<script lang="ts">
  import { labels } from "../(data)/data.js";
  import { Badge } from "$lib/components/ui/badge/index.js";

  let { labelValue }: { labelValue?: string } = $props();

  const label = $derived(labels.find((label) => label.value === labelValue));
</script>

<div class="flex space-x-2">
  {#if label}
    <Badge variant="outline">{label.label}</Badge>
  {:else}
    <Badge variant="outline">General</Badge>
  {/if}
</div>

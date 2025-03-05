<script lang="ts">
  let { value }: { value?: string } = $props();
</script>

<div class="flex space-x-2">
  <span class="max-w-[500px] truncate font-medium">
    {value}
  </span>
</div>

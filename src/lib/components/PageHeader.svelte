<script lang="ts">
  let { title = "Page Title", subtitle = "Page Subtitle" } = $props();
</script>

<div class="py-4 hidden sm:block">
  <h1 class="text-2xl">{title}</h1>
  <h2 class="text-sm text-zinc-500 dark:text-zinc-300 italic">
    {subtitle}
  </h2>
</div>

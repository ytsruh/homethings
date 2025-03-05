<script lang="ts">
  import { buttonVariants } from "@/lib/components/ui/button";
  import PageHeader from "@/lib/components/PageHeader.svelte";
</script>

<svelte:head>
  <title>Wealth | Homethings</title>
  <meta name="description" content="Your personal wealth tracker" />
</svelte:head>

<PageHeader title="Wealth Tracker" subtitle="Coming soon..." />
<div class="w-full flex justify-end items-end">
  <a href="/wealth/new" class={buttonVariants({ variant: "default" })}>
    New Account
  </a>
</div>

<script lang="ts">
  import type { PageData } from "./$types";
  import PageHeader from "@/lib/components/PageHeader.svelte";
  import NewAccountForm from "./NewAccountForm.svelte";
  export let data: PageData;
</script>

<svelte:head>
  <title>Wealth | Homethings</title>
  <meta name="description" content="Your personal wealth tracker" />
</svelte:head>

<PageHeader title="Wealth Tracker" subtitle="Create a new wealth account" />
<NewAccountForm data={data.form} />

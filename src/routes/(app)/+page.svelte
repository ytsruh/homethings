<script lang="ts">
  import type { PageServerData } from "./$types";
  let { data }: { data: PageServerData } = $props();
</script>

<svelte:head>
  <title>Dashboard | Homethings</title>
  <meta name="description" content="Welcome to your Homethings dashboard" />
</svelte:head>

<h1>Hi, {data.user.email}!</h1>
<p>Your user ID is {data.user.id}.</p>

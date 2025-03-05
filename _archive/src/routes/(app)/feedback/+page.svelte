<script lang="ts">
  import type { PageData } from "./$types";
  import PageHeader from "@/lib/components/PageHeader.svelte";
  import FeedbackForm from "./FeedbackForm.svelte";
  export let data: PageData;
</script>

<svelte:head>
  <title>Feedback | Homethings</title>
  <meta name="description" content="Submit feedback, report bugs or request changes" />
</svelte:head>

<PageHeader title="Feedback" subtitle="Request changes, provide feedback or report a bug" />
<FeedbackForm data={data.form} />

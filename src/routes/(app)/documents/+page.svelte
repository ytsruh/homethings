<script>
  import PageHeader from "@/lib/components/PageHeader.svelte";
  import DocumentsTable from "./DocumentsTable.svelte";
  import { columns } from "./columns";

  let { data } = $props();
</script>

<svelte:head>
  <title>Documents | Homethings</title>
  <meta name="description" content="Document storage shared across your account" />
</svelte:head>

<PageHeader title="Documents" subtitle="Document storage shared across your account" />
<DocumentsTable data={data.payments} {columns} />

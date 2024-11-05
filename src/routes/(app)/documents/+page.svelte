<script lang="ts">
  import PageHeader from "@/lib/components/PageHeader.svelte";
  import DocumentsTable from "./DocumentsTable.svelte";
  import { columns } from "./columns";
  import type { PageData } from "./$types";
  import UploadForm from "./UploadForm.svelte";

  export let data: PageData;
</script>

<svelte:head>
  <title>Documents | Homethings</title>
  <meta
    name="description"
    content="Document storage shared across your account"
  />
</svelte:head>

<PageHeader
  title="Documents"
  subtitle="Document storage shared across your account"
/>
<DocumentsTable data={data.documents} {columns} />
<UploadForm data={data.form} />

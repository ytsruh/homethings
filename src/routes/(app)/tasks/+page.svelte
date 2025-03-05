<script lang="ts">
  import DataTable from "./(components)/data-table.svelte";
  import { data } from "./(data)/tasks.js";
  import { columns } from "./(components)/columns.js";
  import PageHeader from "@/lib/components/PageHeader.svelte";
</script>

<PageHeader title="Tasks" subtitle="Organise your day" />
<DataTable {data} {columns} />

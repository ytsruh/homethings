<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<a href="/demo/lucia">lucia</a>
{#each data.items as item}
	<p>{item.name}</p>
{/each}

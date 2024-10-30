<script lang='ts'>
	import { enhance } from '$app/forms';
	import type { PageServerData } from './$types';
	import { Button } from "$lib/components/ui/button/index.js";
 	import ChevronRight from "lucide-svelte/icons/chevron-right";

	let { data }: { data: PageServerData } = $props();
</script>

<h1>Hi, {data.user.username}!</h1>
<p>Your user ID is {data.user.id}.</p>
<form method='post' action='?/logout' use:enhance>
	<button>Sign out</button>
</form>
 
<h1>Welcome to SvelteKit</h1>
<div class="flex flex-row gap-5 py-5">
<Button variant="outline" size="icon">
 <ChevronRight class="size-4" />
</Button>
 
<Button>Click me</Button>
</div>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
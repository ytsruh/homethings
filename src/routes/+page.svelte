<script lang="ts">
 import { Button } from "$lib/components/ui/button/index.js";
 import ChevronRight from "lucide-svelte/icons/chevron-right";
</script>
 
<h1>Welcome to SvelteKit</h1>
<div class="flex flex-row gap-5 py-5">
<Button variant="outline" size="icon">
 <ChevronRight class="size-4" />
</Button>
 
<Button>Click me</Button>
</div>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import { buttonVariants } from "@/lib/components/ui/button";
  let { data }: { data: any } = $props();
</script>

<Card.Root>
  <Card.Header>
    <Card.Title>{data.title}</Card.Title>
  </Card.Header>
  <Card.Content>
    <Card.Description class="min-h-12 sm:min-h-24 lg:min-h-32 break-words">
      {#if data.body?.length > 150}
        {data.body?.substring(0, 150) + "..."}
      {:else}
        {data.body}
      {/if}
    </Card.Description>
  </Card.Content>
  <Card.Footer>
    <a href={`/notes/${data.id}`} class={buttonVariants({ variant: "default" })}> View </a>
  </Card.Footer>
</Card.Root>

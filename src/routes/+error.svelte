<script>
  import { page } from "$app/stores";
  import { buttonVariants } from "$lib/components/ui/button";
  import notFound from "$lib/assets/404.jpg";
  import error from "$lib/assets/500.jpg";
</script>

<div class="min-h-screen flex flex-col items-center justify-center">
  <div class="flex flex-col items-center justify-center">
    <a href="/" class={buttonVariants({ variant: "default" })}> Home </a>
    {#if $page.status === 404}
      <img src={notFound} alt="" class="w-full lg:w-1/2 rounded-r-2xl" />
    {:else}
      <img src={error} alt="" class="w-full lg:w-1/2 rounded-r-2xl" />
    {/if}
  </div>
</div>

<script lang="ts">
  import img from "$lib/assets/login.webp";
  import { Toaster } from "$lib/components/ui/sonner/index.js";
  import type { PageData } from "./$types.js";
  import LoginForm from "./LoginForm.svelte";
  export let data: PageData;
</script>

<svelte:head>
  <title>Login | Homethings</title>
  <meta name="description" content="Login to your Homethings account" />
</svelte:head>

<div class="flex flex-col items-center justify-center h-screen max-h-screen">
  <div
    class="flex flex-col m-6 space-y-10 shadow-2xl rounded-2xl md:flex-row md:space-y-0 md:m-0 dark:bg-zinc-900"
  >
    <div class="p-6 md:p-20">
      <div class="text-center py-5">
        <h1 class="text-5xl py-2">
          Welcome to <span class="text-theme">Homethings</span>
        </h1>
        <h6 class="text-xl py-2">Login to view awesome things</h6>
      </div>
      <LoginForm data={data.form} />
    </div>
    <img src={img} alt="" class="w-96 hidden lg:block rounded-r-2xl" />
  </div>
  <Toaster />
</div>

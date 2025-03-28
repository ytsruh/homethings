<script>
  import { page } from "$app/stores";
</script>

<div class="flex flex-col items-center justify-center">
  <h1>{$page.status}</h1>
  <h2>{$page.error?.message || "Something went wrong"}</h2>
</div>

<script lang="ts">
  import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
  import { page } from "$app/stores";
  let paths = $derived.by(() => {
    return $page.url.pathname.split("/").filter((path) => path !== "");
  });
</script>

<Breadcrumb.Root class="my-3 ml-3">
  <Breadcrumb.List>
    <Breadcrumb.Item>
      <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
    </Breadcrumb.Item>
    {#each paths as path, index}
      <Breadcrumb.Separator />
      <Breadcrumb.Item>
        <Breadcrumb.Link href={"/" + paths.slice(0, index + 1).join("/")} class="capitalize">
          {path}
        </Breadcrumb.Link>
      </Breadcrumb.Item>
    {/each}
  </Breadcrumb.List>
</Breadcrumb.Root>

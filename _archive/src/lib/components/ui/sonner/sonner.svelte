<script lang="ts">
  import { Toaster as Sonner, type ToasterProps as SonnerProps } from "svelte-sonner";
  import { mode } from "mode-watcher";

  let restProps: SonnerProps = $props();
</script>

<Sonner
  theme={$mode}
  class="toaster group"
  toastOptions={{
    classes: {
      error: "bg-theme text-background dark:text-foreground",
      //   success: 'text-green-400',
      //   warning: 'text-yellow-400',
      //   info: 'bg-blue-400',
      //   toast:
      //     'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
      description: "group-[.toast]:text-muted-foreground",
      actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
      cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
    },
  }}
  {...restProps}
/>

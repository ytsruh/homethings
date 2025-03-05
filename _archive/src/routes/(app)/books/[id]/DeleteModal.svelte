<script lang="ts">
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
  import { buttonVariants } from "$lib/components/ui/button/index.js";
  import { toast } from "svelte-sonner";

  let { id }: { id: string } = $props();
  let dialogOpen: boolean = $state(false);
</script>

<AlertDialog.Root bind:open={dialogOpen}>
  <AlertDialog.Trigger class={buttonVariants({ variant: "destructive" })}>
    Delete
  </AlertDialog.Trigger>
  <AlertDialog.Content>
    <form
      method="POST"
      action="?/delete"
      use:enhance={() => {
        return async ({ result }) => {
          if (result.type === "success") {
            dialogOpen = false;
            toast.success("Your book successfully deleted");
            goto(`/books`, { invalidateAll: true });
          }
          if (result.type === "failure") {
            if (result.data?.message) {
              toast.error(result.data.message as string);
            } else {
              toast.error(
                "Something went wrong & your book was not deleted. Please try again.",
              );
            }
          }
        };
      }}
    >
      <AlertDialog.Header>
        <AlertDialog.Title class="text-theme">
          Are you sure you want to delete this book?
        </AlertDialog.Title>
        <AlertDialog.Description>
          This action cannot be undone. This will permanently delete your book
          and remove it from the database.
        </AlertDialog.Description>
      </AlertDialog.Header>
      <input type="hidden" name="id" value={id} />
      <AlertDialog.Footer class="pt-5">
        <AlertDialog.Cancel type="button">Cancel</AlertDialog.Cancel>
        <AlertDialog.Action
          type="submit"
          class={buttonVariants({ variant: "destructive" })}
        >
          Delete
        </AlertDialog.Action>
      </AlertDialog.Footer>
    </form>
  </AlertDialog.Content>
</AlertDialog.Root>

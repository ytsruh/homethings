<script lang="ts">
  import { goto } from "$app/navigation";
  import * as Form from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input";
  import Button, {
    buttonVariants,
  } from "@/lib/components/ui/button/button.svelte";
  import Switch from "@/lib/components/ui/switch/switch.svelte";
  import DeleteModal from "./DeleteModal.svelte";
  import { updateBookFormSchema, type UpdateBookFormSchema } from "$lib/schema";
  import { toast } from "svelte-sonner";
  import {
    type SuperValidated,
    type Infer,
    superForm,
  } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";

  export let data: SuperValidated<Infer<UpdateBookFormSchema>>;
  export let id: string;

  const form = superForm(data, {
    validators: zodClient(updateBookFormSchema),
    onUpdate: ({ result }) => {
      if (result.type === "success") {
        toast.success("Book successfully updated");
        return goto(`/books`);
      }
      if (result.type === "failure") {
        toast.error("Something went wrong. Book has not been updated");
        return;
      }
    },
  });

  const { form: formData, enhance } = form;
</script>

<form
  method="POST"
  class="w-full flex flex-col gap-2 px-0 lg:px-10"
  action="?/update"
  use:enhance
>
  <Form.Field {form} name="name" class="w-full">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Title</Form.Label>
        <Input {...props} bind:value={$formData.name} />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Field {form} name="author">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Author</Form.Label>
        <Input {...props} bind:value={$formData.author} />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Field {form} name="genre">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Genre</Form.Label>
        <Input {...props} bind:value={$formData.genre} />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Field {form} name="isbn">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>ISBN</Form.Label>
        <Input {...props} bind:value={$formData.isbn} />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Field {form} name="read">
    <Form.Control>
      {#snippet children({ props })}
        <div class="w-full flex justify-between items-center">
          <Form.Label>Read</Form.Label>
          <Switch {...props} checked={$formData.read as boolean} name="read" />
        </div>
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Field {form} name="wishlist">
    <Form.Control>
      {#snippet children({ props })}
        <div class="w-full flex justify-between items-center">
          <Form.Label>Wishlist</Form.Label>
          <Switch
            {...props}
            checked={$formData.wishlist as boolean}
            name="wishlist"
          />
        </div>
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
  <div class="flex justify-between w-full py-5">
    <DeleteModal id={id as string} />
    <div class="flex gap-2">
      <a href="/books" class={buttonVariants({ variant: "secondary" })}>
        Cancel
      </a>
      <Button type="submit">Update</Button>
    </div>
  </div>
</form>

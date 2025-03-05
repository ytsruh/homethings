<script lang="ts">
  import * as Form from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input";
  import { Button } from "@/lib/components/ui/button";
  import { Switch } from "@/lib/components/ui/switch";
  import { createBookFormSchema, type CreateBookFormSchema } from "$lib/schema";
  import { toast } from "svelte-sonner";
  import {
    type SuperValidated,
    type Infer,
    superForm,
  } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";
  import { goto } from "$app/navigation";

  export let data: SuperValidated<Infer<CreateBookFormSchema>>;

  const form = superForm(data, {
    validators: zodClient(createBookFormSchema),
    onUpdate: ({ result }) => {
      if (result.type === "success") {
        toast.success("Note successfully created");
        return goto(`/books`, { invalidateAll: true });
      }
      if (result.type === "failure") {
        toast.error("Something went wrong. Please try again.");
      }
    },
  });

  const { form: formData, enhance } = form;
</script>

<form method="POST" use:enhance class="w-full lg:w-2/3 flex flex-col gap-2">
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
  <Form.Field {form} name="image">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Image url</Form.Label>
        <Input {...props} bind:value={$formData.image} />
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
  <div>
    <Button type="submit">Create</Button>
  </div>
</form>

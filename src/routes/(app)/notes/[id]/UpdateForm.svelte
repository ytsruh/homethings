<script lang="ts">
  import { goto } from "$app/navigation";
  import * as Form from "$lib/components/ui/form/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { updateNoteFormSchema, type UpdateNoteFormSchema } from "$lib/schema";
  import { Textarea } from "@/lib/components/ui/textarea";
  import { toast } from "svelte-sonner";
  import {
    type SuperValidated,
    type Infer,
    superForm,
  } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";

  export let data: SuperValidated<Infer<UpdateNoteFormSchema>>;

  const form = superForm(data, {
    validators: zodClient(updateNoteFormSchema),
    onUpdate: ({ result }) => {
      if (result.type === "success") {
        toast.success("Note successfully updated");
        goto(`/notes`);
      }
      if (result.type === "failure") {
        toast.error("Something went wrong. Note has not been updated");
        return;
      }
    },
  });

  const { form: formData, enhance } = form;
</script>

<form
  method="POST"
  class="max-w-2xl w-full flex flex-col gap-5"
  action="?/update"
  use:enhance
>
  <Form.Field {form} name="title">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Title</Form.Label>
        <Input {...props} bind:value={$formData.title} />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Field {form} name="body">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Body / Text</Form.Label>
        <Textarea rows={15} {...props} bind:value={$formData.body} />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
  <div class="flex justify-end items-center">
    <Form.Button>Submit</Form.Button>
  </div>
</form>

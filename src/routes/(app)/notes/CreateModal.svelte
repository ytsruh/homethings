<script lang="ts">
  import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
  import { buttonVariants } from "$lib/components/ui/button/index.js";
  import * as Form from "$lib/components/ui/form/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { createNoteFormSchema, type CreateNoteFormSchema } from "$lib/schema";
  import Textarea from "@/lib/components/ui/textarea/textarea.svelte";
  import { toast } from "svelte-sonner";
  import { type SuperValidated, type Infer, superForm } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";

  export let data: SuperValidated<Infer<CreateNoteFormSchema>>;
  export let dialogOpen: boolean = false  
  
  const form = superForm(data, {
    validators: zodClient(createNoteFormSchema),
    onUpdate: ({ result }) => {
      if (result.type === "success") {
        toast.success("Note successfully created");
        dialogOpen = false;
      }
      if (result.type === "failure") {
        toast.error("Something went wrong. Please try again.");
      }
    },
  });

  const { form: formData, enhance } = form;
</script>

<AlertDialog.Root bind:open={dialogOpen}>
  <AlertDialog.Trigger class={buttonVariants({ variant: "default" })}>Create</AlertDialog.Trigger>
  <AlertDialog.Content>
    <form method="POST" use:enhance>
      <AlertDialog.Header>
        <AlertDialog.Title class="text-theme">Create a new Note</AlertDialog.Title>
      </AlertDialog.Header>
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
            <Textarea rows={5} {...props} bind:value={$formData.body} />
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>
      <AlertDialog.Footer class="pt-5">
        <AlertDialog.Cancel type="button">Cancel</AlertDialog.Cancel>
        <AlertDialog.Action type="submit"> 
          Submit
        </AlertDialog.Action>
      </AlertDialog.Footer>
    </form>
  </AlertDialog.Content>
</AlertDialog.Root>

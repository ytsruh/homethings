<script lang="ts">
  import { goto } from "$app/navigation";
  import * as Form from "$lib/components/ui/form/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import {
    updateDocumentFormSchema,
    type UpdateDocumentFormSchema,
  } from "$lib/schema";
  import { Textarea } from "@/lib/components/ui/textarea";
  import { toast } from "svelte-sonner";
  import {
    type SuperValidated,
    type Infer,
    superForm,
  } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";
  import ArrowLeft from "lucide-svelte/icons/arrow-left";
  import { Button, buttonVariants } from "@/lib/components/ui/button";

  export let data: SuperValidated<Infer<UpdateDocumentFormSchema>>;

  const form = superForm(data, {
    validators: zodClient(updateDocumentFormSchema),
    onUpdate: ({ result }) => {
      if (result.type === "success") {
        toast.success("Document successfully updated");
        return goto(`/documents`);
      }
      if (result.type === "failure") {
        toast.error("Something went wrong. Document has not been updated");
        return;
      }
    },
  });

  const { form: formData, enhance } = form;
</script>

<form method="POST" class="max-w-4xl w-full flex flex-col gap-5" use:enhance>
  <Form.Field {form} name="title">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Title</Form.Label>
        <Input {...props} bind:value={$formData.title} />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Field {form} name="description">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Description</Form.Label>
        <Textarea rows={5} {...props} bind:value={$formData.description} />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
  <div class="flex justify-between w-full py-5">
    <a href={`/documents`} class={buttonVariants({ variant: "secondary" })}>
      <ArrowLeft class="mr-2 h-4 w-4" />
      Back
    </a>
    <Button type="submit">Update</Button>
  </div>
</form>

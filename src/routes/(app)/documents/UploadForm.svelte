<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import * as Form from "$lib/components/ui/form";
  import {
    uploadDocumentFormSchema,
    type UploadDocumentFormSchema,
  } from "$lib/schema";
  import {
    type SuperValidated,
    type Infer,
    superForm,
  } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";

  export let data: SuperValidated<Infer<UploadDocumentFormSchema>>;

  const form = superForm(data, {
    validators: zodClient(uploadDocumentFormSchema),
  });

  const { form: formData, enhance } = form;
</script>

<h2 class="text-xl py-5">Upload a document</h2>
<form method="POST" use:enhance enctype="multipart/form-data" action="?/upload">
  <div
    class="w-full flex flex-col md:flex-row justify-center items-center gap-2"
  >
    <Form.Field {form} name="title" class="w-full">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Title</Form.Label>
          <Input
            {...props}
            bind:value={$formData.title}
            placeholder="File name"
          />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>
    <Form.Field {form} name="fileName" class="w-full">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>File</Form.Label>
          <Input
            {...props}
            type="file"
            name="fileName"
            accept="*/*"
            oninput={(e: Event) => {
              const target = e.currentTarget as HTMLInputElement;
              $formData.fileName = target.files?.item(0) as File;
            }}
          />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>
  </div>
  <div class="flex items-center justify-end w-full py-2">
    <Form.Button>Upload</Form.Button>
  </div>
</form>

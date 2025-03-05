<script lang="ts">
  import * as Form from "$lib/components/ui/form/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import {
    createWealthAccountSchema,
    type CreateWealthAccountSchema,
  } from "$lib/schema";
  import {
    type SuperValidated,
    type Infer,
    superForm,
  } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";
  import { toast } from "svelte-sonner";
  import Textarea from "@/lib/components/ui/textarea/textarea.svelte";
  import { buttonVariants } from "@/lib/components/ui/button";
  import ArrowLeft from "lucide-svelte/icons/arrow-left";

  export let data: SuperValidated<Infer<CreateWealthAccountSchema>>;

  const form = superForm(data, {
    validators: zodClient(createWealthAccountSchema),
    onUpdate: ({ result }) => {
      if (result.type === "success") {
        toast.success("Account created successfully.");
      }
      if (result.type === "failure") {
        toast.error("Something went wrong, account not created.");
      }
    },
  });
  const { form: formData, enhance } = form;
</script>

<div class="w-full flex items-center justify-center py-2">
  <form method="POST" use:enhance class="w-full lg:w-2/3">
    <Form.Field {form} name="name">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Name</Form.Label>
          <Input {...props} bind:value={$formData.name} autocomplete="off" />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>
    <Form.Field {form} name="type">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Type</Form.Label>
          <Select.Root
            type="single"
            bind:value={$formData.type}
            name={props.name}
          >
            <Select.Trigger {...props} class="capitalize">
              {$formData.type ? $formData.type : "Select an account type"}
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="asset" label="Asset" />
              <Select.Item value="liability" label="Liability" />
            </Select.Content>
          </Select.Root>
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>
    <Form.Field {form} name="notes">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Notes</Form.Label>
          <Textarea
            rows={5}
            {...props}
            bind:value={$formData.notes}
            autocomplete="off"
          />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>
    <div class="flex justify-between items-center">
      <a href={`/wealth`} class={buttonVariants({ variant: "secondary" })}>
        <ArrowLeft class="mr-2 h-4 w-4" />
        Back
      </a>
      <Form.Button class="my-2">Submit</Form.Button>
    </div>
  </form>
</div>

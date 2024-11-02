<script lang="ts">
 import * as Form from "$lib/components/ui/form/index.js";
 import { Input } from "$lib/components/ui/input/index.js";
 import { feedbackFormSchema, type FeedbackFormSchema } from "$lib/schema";
 import {
  type SuperValidated,
  type Infer,
  superForm,
 } from "sveltekit-superforms";
 import { zodClient } from "sveltekit-superforms/adapters";
 import { toast } from "svelte-sonner";
 import Textarea from "@/lib/components/ui/textarea/textarea.svelte";

 export let data: SuperValidated<Infer<FeedbackFormSchema>>;
 
 const form = superForm(data, {
  validators: zodClient(feedbackFormSchema),
  onUpdate: ({ result }) => {
    if (result.type === "success"){
        toast.success("Thanks for your feedback!");
    }
    if (result.type === "failure"){
        toast.error("Something went wrong");
    }
  }
 });
 const { form: formData, enhance } = form;
 
</script>
 
<div class="w-full lg:w-2/3 flex items-center justify-center py-2">
    <form method="POST" use:enhance class="w-full">
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
                <Form.Label>Body / Message</Form.Label>
                <Textarea rows={5} {...props} bind:value={$formData.body} />
            {/snippet}
            </Form.Control>
            <Form.FieldErrors />
        </Form.Field>
        <Form.Button class="my-2">Submit</Form.Button>
    </form>
</div>
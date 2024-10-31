<script lang="ts">
 import * as Form from "$lib/components/ui/form/index.js";
 import { Input } from "$lib/components/ui/input/index.js";
 import { loginFormSchema, type LoginFormSchema } from "$lib/schema";
 import {
  type SuperValidated,
  type Infer,
  superForm,
 } from "sveltekit-superforms";
 import { zodClient } from "sveltekit-superforms/adapters";
 import { toast } from "svelte-sonner";
 import DarkModeToggle from "@/lib/components/DarkModeToggle.svelte"
 export let data: SuperValidated<Infer<LoginFormSchema>>;
 
 const form = superForm(data, {
  validators: zodClient(loginFormSchema),
  onUpdate: ({ form, formElement, cancel, result }) => {
    //cancel()
    console.log(result);
    if (result.type === "failure"){
        toast.error("Something went wrong");
    }
  }
 });
 const { form: formData, enhance } = form;
 
</script>
 
<form method="POST" use:enhance>
 <Form.Field {form} name="username">
  <Form.Control>
   {#snippet children({ props })}
    <Form.Label>Username/email</Form.Label>
    <Input {...props} bind:value={$formData.username} />
   {/snippet}
  </Form.Control>
 </Form.Field>
 <Form.Field {form} name="password">
  <Form.Control>
   {#snippet children({ props })}
    <Form.Label>Password</Form.Label>
    <Input {...props} bind:value={$formData.password} type="password"/>
   {/snippet}
  </Form.Control>
 </Form.Field>
    <div class="flex justify-between items-center py-5"> 
        <Form.Button>Submit</Form.Button>
        <DarkModeToggle />
    </div>
</form>
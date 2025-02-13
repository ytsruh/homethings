<script lang="ts">
  import PageHeader from "@/lib/components/PageHeader.svelte";
  import { Button } from "@/lib/components/ui/button";
  import { Input } from "@/lib/components/ui/input";
  import { Label } from "@/lib/components/ui/label";
  import { Switch } from "@/lib/components/ui/switch";
  import type { PageServerData, ActionData } from "./$types";

  let { data, form }: { data: PageServerData; form: ActionData } = $props();
</script>

<svelte:head>
  <title>Profile | Homethings</title>
  <meta name="description" content="Manage your profile & account" />
</svelte:head>

<PageHeader
  title="Profile"
  subtitle="Change your profile picture or show/hide features to personalise your experience."
/>
<form
  method="POST"
  class="w-full flex flex-col justify-center items-center gap-2"
>
  <div class="w-full grid grid-cols-1 md:grid-cols-2 gap-5">
    <div class="w-full">
      <Label>Name:</Label>
      <Input
        class="my-2"
        type="text"
        placeholder="Name"
        name="name"
        value={data.user.name}
      />
    </div>
    <div class="w-full">
      <Label>Email:</Label>
      <Input class="my-2" type="text" value={data.user.email} disabled />
    </div>
  </div>
  <div class="w-full grid grid-cols-1 md:grid-cols-2 gap-5">
    <div class="w-full flex justify-between items-center">
      <div>
        <Label>Show Documents:</Label>
      </div>
      <Switch name="showDocuments" checked={data.user.showDocuments || false} />
    </div>
    <div class="w-full flex justify-between items-center">
      <div>
        <Label>Show Notes:</Label>
      </div>
      <Switch name="showNotes" checked={data.user.showNotes || false} />
    </div>
    <div class="w-full flex justify-between items-center">
      <div>
        <Label>Show Books:</Label>
      </div>
      <Switch name="showBooks" checked={data.user.showBooks || false} />
    </div>
    <div class="w-full flex justify-between items-center">
      <div>
        <Label>Show Chat:</Label>
      </div>
      <Switch name="showChat" checked={data.user.showChat || false} />
    </div>
    <div class="w-full flex justify-between items-center">
      <div>
        <Label>Show Wealth:</Label>
      </div>
      <Switch name="showWealth" checked={data.user.showWealth || false} />
    </div>
    <div class="w-full flex justify-between items-center">
      <div>
        <Label>Show Tasks:</Label>
      </div>
      <Switch name="showTasks" checked={data.user.showTasks || false} />
    </div>
  </div>
  <div class="flex items-center justify-end w-full py-5 gap-2">
    {#if form?.success === false}
      <p class="text-theme">Error. Please try again.</p>
    {/if}
    <Button type="submit">Update</Button>
  </div>
</form>

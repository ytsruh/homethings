<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Textarea } from "$lib/components/ui/textarea";
  import { Label } from "$lib/components/ui/label";
  import PageHeader from "@/lib/components/PageHeader.svelte";
  import { Badge } from "$lib/components/ui/badge";
  import { X } from "lucide-svelte";

  let title = "";
  let description = "";
  let newLabel = "";
  let labels: string[] = [];
  let files: FileList;

  function addLabel() {
    if (newLabel.trim()) {
      labels = [...labels, newLabel.trim()];
      newLabel = "";
    }
  }

  function removeLabel(label: string) {
    labels = labels.filter((l) => l !== label);
  }

  function handleSubmit() {
    // TODO: Implement form submission
    console.log({
      title,
      description,
      labels,
      files: [],
    });
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();
      addLabel();
    }
  }
</script>

<PageHeader title="New Task" subtitle="Add a new task to your list" />

<form class="space-y-6 max-w-2xl mx-auto">
  <div class="space-y-2">
    <Label for="title">Title</Label>
    <Input
      id="title"
      bind:value={title}
      placeholder="Enter task title"
      required
    />
  </div>

  <div class="space-y-2">
    <Label for="description">Description</Label>
    <Textarea
      id="description"
      bind:value={description}
      placeholder="Enter task description"
    />
  </div>

  <div class="space-y-2">
    <Label for="labels">Labels</Label>
    <div class="flex gap-2 mb-2 flex-wrap">
      {#each labels as label}
        <Badge variant="secondary" class="flex items-center gap-1">
          {label}
          <button
            type="button"
            class="hover:text-destructive"
            on:click={() => removeLabel(label)}
          >
            <X class="h-3 w-3" />
          </button>
        </Badge>
      {/each}
    </div>
    <Input
      id="labels"
      bind:value={newLabel}
      placeholder="Type a label and press Enter"
    />
  </div>

  <div class="space-y-2">
    <Label for="picture">Documents</Label>
    <Input id="picture" type="file" />
  </div>

  <div class="flex justify-end gap-4">
    <Button href="/tasks" variant="outline">Cancel</Button>
    <Button type="submit">Create Task</Button>
  </div>
</form>

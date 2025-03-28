<script lang="ts">
  import type { PageData } from "./$types";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Textarea } from "$lib/components/ui/textarea";
  import { Label } from "$lib/components/ui/label";
  import { Badge } from "$lib/components/ui/badge";
  import PageHeader from "@/lib/components/PageHeader.svelte";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
  } from "$lib/components/ui/card";
  import { X, Paperclip } from "lucide-svelte";

  let { data }: { data: PageData } = $props();

  // TODO: Replace with actual data fetching
  let task = data.task;

  let newComment = "";
  let newDocument: FileList;

  // TODO: Replace with actual data
  let comments = [
    {
      id: 1,
      text: "Started working on this task",
      author: "John Doe",
      timestamp: "2024-03-20 10:30",
    },
  ];

  let newLabel = "";
  let labels = [...task.labels];

  function formatTimestamp(timestamp: string) {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("en-UK", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date);
  }

  function addComment() {
    if (newComment.trim()) {
      comments = [
        ...comments,
        {
          id: comments.length + 1,
          text: newComment,
          author: "Current User", // TODO: Replace with actual user
          timestamp: new Date().toISOString(), // Store in ISO format
        },
      ];
      newComment = "";
    }
  }

  function handleFileUpload() {
    // TODO: Implement file upload
    console.log("Uploading files:", "newDocument");
  }

  function addLabel() {
    if (newLabel.trim()) {
      labels = [...labels, newLabel.trim()];
      newLabel = "";
    }
  }

  function removeLabel(label: string) {
    labels = labels.filter((l) => l !== label);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();
      addLabel();
    }
  }

  function saveTask() {
    // TODO: Implement save functionality
    console.log("Saving task:", { ...task, labels });
  }
</script>

<PageHeader title="Edit Task" subtitle="Update task details" />
<div>
  <div class="flex flex-col gap-y-5">
    <!-- Main Content -->
    <div class="grid grid-cols-1 xl:grid-cols-6 gap-5">
      <!-- Task Details Section -->
      <div class="xl:col-span-4 col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-6">
              <div class="space-y-2">
                <Label for="title">Title</Label>
                <Input
                  id="title"
                  bind:value={task.title}
                  placeholder="Enter task title"
                />
              </div>

              <div class="space-y-2">
                <Label for="description">Description</Label>
                <Textarea
                  id="description"
                  bind:value={task.description}
                  placeholder="Enter task description"
                />
              </div>

              <div class="space-y-2">
                <Label for="status">Status</Label>
                <select
                  id="status"
                  bind:value={task.status}
                  class="w-full rounded-md border border-input px-3 py-2"
                >
                  <option value="Todo">Todo</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
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
                  onkeydown={handleKeydown}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter class="flex justify-end">
            <div class="flex gap-2">
              <Button variant="outline" href="/tasks">Cancel</Button>
              <Button onclick={saveTask}>Save Changes</Button>
            </div>
          </CardFooter>
        </Card>
      </div>
      <!-- Sidebar -->
      <div class="xl:col-span-2 col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div class="grid gap-4">
                {#each task.documents as doc}
                  <div
                    class="flex items-center justify-between p-2 border rounded-lg"
                  >
                    <div class="flex items-center gap-2">
                      <Paperclip class="h-4 w-4" />
                      <span>{doc.name}</span>
                      <span class="text-sm text-muted-foreground"
                        >({doc.size})</span
                      >
                    </div>
                    <Button variant="ghost" size="sm">Download</Button>
                  </div>
                {/each}
              </div>

              <div class="space-y-2">
                <Label for="document">Upload New Document</Label>
                <div class="flex gap-2">
                  <Input id="document" type="file" />
                </div>
                <div class="w-full flex justify-end">
                  <Button onclick={handleFileUpload}>Upload</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    <!-- Comments Section -->
    <Card>
      <CardHeader>
        <CardTitle>Updates & Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <!-- Existing Comments -->
          <div class="space-y-4">
            {#each comments as comment}
              <div class="border rounded-lg p-4">
                <div class="flex justify-start mb-2">
                  <span class="text-sm text-muted-foreground"
                    >{formatTimestamp(comment.timestamp)}</span
                  >
                </div>
                <p>{comment.text}</p>
              </div>
            {/each}
          </div>

          <!-- New Comment Form -->
          <div class="space-y-2">
            <Label for="comment">Add Update</Label>
            <Textarea
              id="comment"
              bind:value={newComment}
              placeholder="Type your update here..."
            />
            <div class="flex justify-end">
              <Button onclick={addComment}>Add Update</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</div>

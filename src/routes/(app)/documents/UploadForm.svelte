<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { enhance } from "$app/forms";
  import { createId } from "@paralleldrive/cuid2";
  import { toast } from "svelte-sonner";
  import { invalidateAll } from "$app/navigation";
</script>

<h2 class="text-xl py-5">Upload a document</h2>
<form
  method="POST"
  use:enhance={async ({ formElement, formData, action, cancel, submitter }) => {
    try {
      // Get form data
      const title = formData.get("title");
      const file = formData.get("file");
      if (!title || !file || !(file instanceof File)) {
        throw new Error("Missing file or title");
      }
      const id = createId();
      // Get a signed URL for the file
      const res = await fetch(
        `/api/documents/url?fileName=${id + "-" + file.name}`,
        {
          method: "PUT",
        },
      );
      const { url } = await res.json();
      // Upload the file to S3
      const uploadRes = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-type": file.type as string,
          "Content-Length": file.size.toString(),
        },
        body: file,
      });
      if (!uploadRes.ok) {
        throw new Error("Failed to upload to S3");
      }
      // Amend the form data with the signed URL file name and remove the file
      formData.append("fileName", id + "-" + file.name);
      formData.delete("file");
    } catch (error) {
      console.log(error);
      toast.error("Failed to upload file");
      cancel();
    }
    return async ({ result, update }) => {
      if (result.type === "success") {
        toast.success("File uploaded successfully");
        invalidateAll(); // Invalidate the data
        update(); // Update the form/ui
        return;
      }
      if (result.type === "failure") {
        toast.error("Failed to upload file");
        return;
      }
    };
  }}
  enctype="multipart/form-data"
  action="?/upload"
>
  <div
    class="w-full flex flex-col md:flex-row justify-center items-center gap-2"
  >
    <input
      type="text"
      name="title"
      class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      placeholder="File name"
    />
    <input
      type="file"
      name="file"
      accept="*/*"
      class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    />
  </div>
  <div class="flex items-center justify-end w-full py-2">
    <Button type="submit">Upload</Button>
  </div>
</form>

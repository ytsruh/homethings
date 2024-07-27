import { getToken, createId } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function UploadForm() {
  const [fileTitle, setFileTitle] = useState("");
  const [fileObject, setFileObject] = useState<any>(undefined);
  const [error, setError] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const id = createId();
      const response = await fetch(`/api/documents/url?fileName=${id + "-" + fileObject.name}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: getToken(),
        },
      });
      if (!response.ok) {
        throw new Error("Failed to get S3 url");
      }
      const res: { url: string } = await response.json();
      const uploadRes = await fetch(res.url, {
        method: "PUT",
        headers: {
          "Content-type": fileObject.type,
        },
        body: fileObject,
      });
      if (!uploadRes.ok) {
        throw new Error("Failed to upload to S3");
      }
      const save = await fetch(`/api/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: getToken() },
        body: JSON.stringify({
          title: fileTitle,
          fileName: id + "-" + fileObject.name,
        }),
      });
      if (!save.ok) {
        throw new Error("Failed to save file");
      }
      window.location.reload();
    } catch (error) {
      console.log(error);
      setError(true);
    }
  }

  return (
    <form
      onSubmit={(e) => submit(e)}
      className="w-full flex flex-col md:flex-row justify-center items-center gap-2">
      <Input
        type="text"
        placeholder="Filename"
        onChange={(e: React.FormEvent<HTMLInputElement>) => setFileTitle(e.currentTarget.value)}
      />
      <Input
        id="file"
        type="file"
        onChange={(e: React.FormEvent<HTMLInputElement>) => setFileObject(e.currentTarget?.files?.[0])}
      />
      <Button type="submit">Upload</Button>
    </form>
  );
}

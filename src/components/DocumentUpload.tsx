import { getToken, queryClient } from "@/lib/utils";
import { createId } from "@paralleldrive/cuid2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Document } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

type CreateDocumentResponse = {
  message: string;
  data: Document[];
};

type CreateDocumentInput = {
  title: string;
  file: File;
};

export default function UploadForm() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const mutation = useMutation<CreateDocumentResponse, Error, CreateDocumentInput>({
    mutationFn: async (input) => {
      const id = createId();
      const response = await fetch(`/api/documents/url?fileName=${id + "-" + input.title}`, {
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
          "Content-type": input.file.type,
        },
        body: input.file,
      });
      if (!uploadRes.ok) {
        throw new Error("Failed to upload to S3");
      }
      const save = await fetch(`/api/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: getToken() },
        body: JSON.stringify({
          title: input.title,
          fileName: id + "-" + input.title,
        }),
      });
      return await save.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast({
        title: "Success",
        description: "Your document has been created successfully.",
      });
      navigate("/documents", { replace: false });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Something went wrong. Please try again.",
      });
    },
  });

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fields = Object.fromEntries(new FormData(e.target as HTMLFormElement));
    if (!fields.title || !fields.file) {
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Please ensure that both a document title is set & a file is included",
      });
      return;
    }
    mutation.mutate({
      title: fields.title as string,
      file: fields.file as File,
    });
  }

  if (mutation.isPending) {
    return (
      <div className="w-full flex flex-col md:flex-row justify-center items-center gap-2">
        <p>Submitting...</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="w-full flex flex-col md:flex-row justify-center items-center gap-2">
      <Input type="text" name="title" placeholder="Filename" />
      <Input id="file" type="file" name="file" />
      <Button type="submit">Upload</Button>
    </form>
  );
}

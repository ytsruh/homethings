import { Link, useLoaderData, useNavigate } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import PageHeader from "@/components/PageHeader";
import { useToast } from "@/components/ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import { getToken, queryClient } from "@/lib/utils";
import { Document } from "@/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type LoadedData = { data: Document };

type UpdateDocumentResponse = {
  message: string;
  data: Document[];
};

type UpdateDocumentInput = {
  title: string;
  description: string;
};

export default function DocumentSingle() {
  const { data } = useLoaderData() as LoadedData;
  const { toast } = useToast();
  const navigate = useNavigate();

  const mutation = useMutation<UpdateDocumentResponse, Error, UpdateDocumentInput>({
    mutationFn: async (input) => {
      const response = await fetch(`/api/documents/${data.id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
        headers: {
          "Content-Type": "application/json",
          Authorization: getToken(),
        },
      });
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      return await response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast({
        title: "Success",
        description: "Your document has been updated.",
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
    if (!fields.title) {
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Please ensure that a document title is set",
      });
      return;
    }
    mutation.mutate(fields as UpdateDocumentInput);
  }

  return (
    <>
      <PageTitle title="Documents | Homethings" />
      <PageHeader title="Documents" subtitle="Make changes to your document" />
      <div className="w-full flex justify-center py-2">
        <form onSubmit={(e) => submit(e)} className="w-full flex flex-col justify-center items-center gap-2">
          <div className="w-full">
            <Label>Document Title / Name:</Label>
            <Input
              className="my-2"
              type="text"
              name="title"
              placeholder="Filename"
              defaultValue={data.title || ""}
            />
          </div>
          <div className="w-full">
            <Label>Document Description:</Label>
            <Textarea
              className="my-2"
              name="description"
              placeholder="Description of document"
              defaultValue={data.description || ""}
            />
          </div>
          <div className="flex justify-between w-full py-5">
            <Button asChild variant="secondary">
              <Link to="/documents">Back</Link>
            </Button>
            <Button type="submit">Update</Button>
          </div>
        </form>
      </div>
    </>
  );
}

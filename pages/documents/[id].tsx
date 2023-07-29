import { useState } from "react";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import PageFrame from "@/components/PageFrame";
import { getSingleDoc } from "pages/api/documents/[id]";
import { Document } from "@/lib/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/router";
import { useLoadingContext } from "@/lib/LoadingContext";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import FormError from "@/components/FormError";

export default function SingleDocument(props: { document: Document }) {
  const router = useRouter();
  const { setLoading } = useLoadingContext();
  const [error, setError] = useState(false);
  const [title, setTitle] = useState(props.document.title);
  const [description, setDescription] = useState(props.document.description || "");

  async function submit(e: any) {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(`/api/documents/${props.document.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title,
          description: description,
        }),
      });
      //Check for ok response
      if (!response.ok) {
        //Throw error if not ok
        throw Error(response.statusText);
      }
      router.push("/documents");
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
      setError(true);
    }
  }

  return (
    <PageFrame title="Documents">
      <div className="py-4">
        <h1 className="text-2xl">Update : {props.document.title}</h1>
        <h2 className="text-sm text-zinc-500 dark:text-zinc-300 italic">Make changes to your document</h2>
      </div>
      <div className="w-full flex justify-center py-2">
        {error ? (
          <FormError reset={setError} />
        ) : (
          <form
            onSubmit={(e) => submit(e)}
            className="w-full flex flex-col justify-center items-center gap-2"
          >
            <div className="w-full">
              <Label>Document Title / Name:</Label>
              <Input
                className="my-2"
                type="text"
                placeholder="Filename"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="w-full">
              <Label>Document Description:</Label>
              <Textarea
                className="my-2"
                placeholder="Description of document"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex justify-between w-full py-5">
              <Button asChild variant="secondary">
                <Link href="/documents">Cancel</Link>
              </Button>
              <Button type="submit">Upload</Button>
            </div>
          </form>
        )}
      </div>
    </PageFrame>
  );
}

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
  const doc = await getSingleDoc(context);
  // Have to stringify then parse otherwise date objects cannot be passed to page
  const stringify = JSON.stringify(doc);
  const parsed = JSON.parse(stringify);
  return {
    props: { document: parsed.data[0] }, // will be passed to the page component as props
  };
};

"use client";
import { useEffect, useState } from "react";
import PageFrame from "@/components/PageFrame";
import type { Document } from "@/db/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useLoadingContext } from "@/lib/LoadingContext";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import FormError from "@/components/FormError";
import Loading from "@/components/Loading";

export default function SingleDocument({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { loading, setLoading } = useLoadingContext();
  const [loaded, setLoaded] = useState(loading);
  const [error, setError] = useState(false);
  const [document, setDocument] = useState<Document>();

  useEffect(() => {
    async function getData() {
      const res = await fetch(`/api/documents/${params.id}`);
      if (!res.ok) {
        throw new Error("Failed to fetch data");
      }
      const doc = await res.json();
      setDocument(doc.data as Document);
      setLoaded(true);
    }
    getData();
  }, []);

  async function submit(e: any) {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(`/api/documents/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: document?.title,
          description: document?.description,
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

  if (!loaded) {
    return <Loading />;
  }

  if (document) {
    return (
      <PageFrame title="Documents">
        <div className="py-4">
          <h1 className="text-2xl">Update : {document.title}</h1>
          <h2 className="text-sm text-zinc-500 dark:text-zinc-300 italic">Make changes to your document</h2>
        </div>
        <div className="w-full flex justify-center py-2">
          {error ? (
            <FormError reset={setError} />
          ) : (
            <form
              onSubmit={(e) => submit(e)}
              className="w-full flex flex-col justify-center items-center gap-2">
              <div className="w-full">
                <Label>Document Title / Name:</Label>
                <Input
                  className="my-2"
                  type="text"
                  placeholder="Filename"
                  value={document.title}
                  onChange={(e) => setDocument({ ...document, title: e.target.value })}
                />
              </div>
              <div className="w-full">
                <Label>Document Description:</Label>
                <Textarea
                  className="my-2"
                  placeholder="Description of document"
                  value={document.description || ""}
                  onChange={(e) => setDocument({ ...document, description: e.target.value })}
                />
              </div>
              <div className="flex justify-between w-full py-5">
                <Button asChild variant="secondary">
                  <Link href="/documents">Cancel</Link>
                </Button>
                <Button type="submit">Update</Button>
              </div>
            </form>
          )}
        </div>
      </PageFrame>
    );
  }
}

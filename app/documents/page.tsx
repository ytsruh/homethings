"use client";
import { useEffect, useState } from "react";
import PageFrame from "@/components/PageFrame";
import { DocumentsTable } from "@/components/DocumentsTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loading from "@/components/Loading";
import { createId } from "@paralleldrive/cuid2";
import { useLoadingContext } from "@/lib/LoadingContext";
import FormError from "@/components/FormError";

export default function Documents() {
  const { loading } = useLoadingContext();
  const [loaded, setLoaded] = useState(loading);
  const [documents, setDocuments] = useState();

  useEffect(() => {
    async function getData() {
      const res = await fetch("/api/documents");
      if (!res.ok) {
        throw new Error("Failed to fetch data");
      }
      const docs = await res.json();
      setDocuments(docs.data);
      setLoaded(true);
    }
    getData();
  }, []);

  if (!loaded) {
    return <Loading />;
  }

  if (documents) {
    return (
      <PageFrame title="Documents">
        <div className="w-full xl:w-10/12">
          <DocumentsTable data={documents} />
          <div className="py-5">
            <h3 className="py-4 text-xl">Upload a new document</h3>
            <UploadForm />
          </div>
        </div>
      </PageFrame>
    );
  }
}

const UploadForm = () => {
  const { setLoading } = useLoadingContext();
  const [fileTitle, setFileTitle] = useState("");
  const [fileObject, setFileObject] = useState<any>(undefined);
  const [error, setError] = useState(false);

  async function submit(e: any) {
    e.preventDefault();
    try {
      setLoading(true);
      const id = createId();
      const response = await fetch(`/api/documents/url?fileName=${id + "-" + fileObject.name}`, {
        method: "PUT",
      });
      if (!response.ok) {
        throw new Error("Failed to get S3 url");
      }
      const res = await response.json();
      const uploadRes = await fetch(res.url, {
        method: "PUT",
        headers: {
          ContentType: fileObject.type,
          "x-amz-acl": "public-read",
        },
        body: fileObject,
      });
      if (!uploadRes.ok) {
        console.log(uploadRes);
        console.log("failed");
        throw new Error("Failed to upload to S3");
      }

      const save = await fetch(`/api/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: fileTitle,
          fileName: id + "-" + fileObject.name,
        }),
      });
      if (!save.ok) {
        throw new Error("Failed to save file");
      }
      e.target.reset();
      window.location.reload();
    } catch (error) {
      setLoading(false);
      console.log(error);
      setError(true);
    }
  }

  if (error) {
    return <FormError reset={setError} />;
  }

  return (
    <form
      onSubmit={(e) => submit(e)}
      className="w-full flex flex-col md:flex-row justify-center items-center gap-2">
      <Input type="text" placeholder="Filename" onChange={(e) => setFileTitle(e.target.value)} />
      <Input id="file" type="file" onChange={(e) => setFileObject(e.target?.files?.[0])} />
      <Button type="submit">Upload</Button>
    </form>
  );
};

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
import { getLocalToken } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function Documents() {
  const router = useRouter();
  const { loading } = useLoadingContext();
  const [loaded, setLoaded] = useState(loading);
  const [documents, setDocuments] = useState();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    async function getData() {
      try {
        const token = await getLocalToken();
        const res = await fetch(`${baseUrl}/documents`, {
          headers: { "Content-Type": "application/json", Authorization: token as string },
        });
        if (res.status === 401) {
          throw Error("unauthorized");
        }
        const data = await res.json();
        setDocuments(data);
        setLoaded(true);
      } catch (error: any) {
        if (error.message === "unauthorized") {
          router.push("/login");
        }
      }
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
  const router = useRouter();
  const { setLoading } = useLoadingContext();
  const [fileTitle, setFileTitle] = useState("");
  const [fileObject, setFileObject] = useState<any>(undefined);
  const [error, setError] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  async function submit(e: any) {
    e.preventDefault();
    try {
      setLoading(true);
      const id = createId();
      const token = await getLocalToken();
      const response = await fetch(`${baseUrl}/documents/url?fileName=${id + "-" + fileObject.name}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: token as string },
      });
      if (response.status === 401) {
        throw Error("unauthorized");
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
      const save = await fetch(`${baseUrl}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token as string },
        body: JSON.stringify({
          title: fileTitle,
          fileName: id + "-" + fileObject.name,
        }),
      });
      if (save.status === 401) {
        throw Error("unauthorized");
      }
      e.target.reset();
      window.location.reload();
    } catch (error: any) {
      if (error.message === "unauthorized") {
        router.push("/login");
      }
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

import { useState } from "react";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import PageFrame from "@/components/PageFrame";
import { getDocs } from "pages/api/documents";
import { Document } from "@/lib/schema";
import { DocumentsTable } from "@/components/DocumentsTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import { createId } from "@paralleldrive/cuid2";
import { useLoadingContext } from "@/lib/LoadingContext";
import FormError from "@/components/FormError";

type DocumentProps = {
  count: number;
  data: Document[];
};

export default function Documents(props: { documents: DocumentProps }) {
  const { documents } = props;

  return (
    <PageFrame title="Documents">
      <div className="w-full xl:w-10/12">
        <DocumentsTable data={documents.data} />
        <div className="py-5">
          <h3 className="py-4 text-xl">Upload a new document</h3>
          <UploadForm />
        </div>
      </div>
    </PageFrame>
  );
}

const UploadForm = () => {
  const router = useRouter();
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
      router.reload();
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
      className="w-full flex flex-col md:flex-row justify-center items-center gap-2"
    >
      <Input type="text" placeholder="Filename" onChange={(e) => setFileTitle(e.target.value)} />
      <Input id="file" type="file" onChange={(e) => setFileObject(e.target?.files?.[0])} />
      <Button type="submit">Upload</Button>
    </form>
  );
};

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
  const docs = await getDocs(context);
  // Have to stringify then parse otherwise date objects cannot be passed to page
  const stringify = JSON.stringify(docs);
  const parsed = JSON.parse(stringify);
  return {
    props: { documents: parsed }, // will be passed to the page component as props
  };
};

import { useState } from "react";
import Protected from "@/components/Protected";
import PageTitle from "@/lib/ui/PageTitle";
import Button from "@/lib/ui/Button";
import Loading from "@/lib/ui/Loading";
import { getDocs } from "../api/documents";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { createId } from "@paralleldrive/cuid2";
import { useRouter } from "next/router";
import Icon from "@/lib/ui/Icon";

export default function Documents(props: any) {
  const { documents } = props;
  return (
    <Protected>
      <div className="flex flex-col">
        <PageTitle title="Documents" image={"img/docs.jpg"} alt="Documents Hero" />
        <div className="flex flex-col px-5 md:px-10 items-center justify-center">
          <UploadForm />
          <DocumentsTable documents={documents} />
        </div>
      </div>
    </Protected>
  );
}

const UploadForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fileTitle, setFileTitle] = useState("");
  const [fileObject, setFileObject] = useState<any>(undefined);
  const [error, setError] = useState("");

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
      await fetch(res.url, {
        method: "PUT",
        headers: {
          ContentType: fileObject.type,
          "x-amz-acl": "public-read",
        },
        body: fileObject,
      });
      if (!response.ok) {
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
      setLoading(false);
      router.reload();
    } catch (error) {
      setLoading(false);
      console.log(error);
      setError("Error");
    }
  }

  if (error) {
    return (
      <div className="py-5">
        <p>Error</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-5">
        <Loading small />
      </div>
    );
  }
  return (
    <form
      onSubmit={(e) => submit(e)}
      className="w-full md:w-2/3 flex flex-col lg:flex-row justify-center items-center gap-2 py-5 md:py-10"
    >
      <input
        type="text"
        className="w-full px-6 py-3 rounded-md focus:outline-none bg-transparent border-coal dark:border-salt border"
        placeholder="Filename"
        onChange={(e) => setFileTitle(e.target.value)}
      />
      <input
        type="file"
        placeholder="Upload file"
        className="w-full px-6 py-2 rounded-md focus:outline-none bg-transparent border-coal dark:border-salt border"
        onChange={(e) => setFileObject(e.target?.files?.[0])}
      />
      <Button type="submit">Upload</Button>
    </form>
  );
};

type TableProps = {
  documents: {
    count: number;
    data: Document[];
  };
};

type Document = {
  id: string;
  title: string;
  description: string;
  fileName: string;
  accountId: string;
  createdAt: string;
  updatedAt: string;
};

const DocumentsTable = (props: TableProps) => {
  async function download(filename: string) {
    const response = await fetch(`/api/documents/url?fileName=${filename}`);
    if (!response.ok) {
      throw new Error("Failed to get S3 url");
    }
    const res = await response.json();
    window.open(res.url, "_blank", "noreferrer");
  }
  const rows = props.documents.data.map((document: Document, i: number) => {
    return (
      <tr className="text-center" key={i}>
        <td>{document.title}</td>
        <td className="hidden md:table-cell">{document.description}</td>
        <td>
          <Button color="bg-slate dark:bg-salt" onClick={() => download(document.fileName)}>
            <Icon icon="GoCloudDownload" color="dark:text-coal" />
          </Button>
        </td>
        <td>
          <a href={`/documents/${document.id}`}>
            <Button color="bg-warning">
              <Icon icon="GoPencil" />
            </Button>
          </a>
        </td>
        <td>
          <Button>
            <Icon icon="GoTrashcan" />
          </Button>
        </td>
      </tr>
    );
  });
  return (
    <div className="w-full md:w-4/5 py-2 md:py-5">
      <table className="w-full table-auto">
        <thead>
          <tr className="text-center bg-primary text-white">
            <th className="p-2">Title</th>
            <th className="hidden md:table-cell">Description</th>
            <th>Download</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
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

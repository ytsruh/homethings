import PageHeader from "@/components/PageHeader";
import PageTitle from "@/components/PageTitle";
import { useLoaderData } from "react-router-dom";
import { Document } from "@/types";
import { DocumentsTable } from "@/components/DocumentsTable";
import UploadForm from "@/components/DocumentUpload";

type LoadedData = {
  count: number;
  data: Document[];
};

export default function Documents() {
  const LoadedData = useLoaderData() as LoadedData;
  return (
    <>
      <PageTitle title="Documents | Homethings" />
      <PageHeader title="Documents" subtitle="Document storage shared across your account with all members" />
      <div className="w-full xl:w-10/12">
        <DocumentsTable data={LoadedData.data} />
        <div className="py-5">
          <h3 className="py-4 text-xl">Upload a new document</h3>
          <UploadForm />
        </div>
      </div>
    </>
  );
}

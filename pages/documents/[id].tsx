import { useState } from "react";
import Protected from "@/components/Protected";
import PageTitle from "@/lib/ui/PageTitle";
import Button from "@/lib/ui/Button";
import Loading from "@/lib/ui/Loading";
import { getSingleDoc } from "../api/documents/[id]";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { createId } from "@paralleldrive/cuid2";
import { useRouter } from "next/router";
import Icon from "@/lib/ui/Icon";
import Alert from "@/lib/ui/Alert";

type DocProps = {
  document: { data: Document[] };
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

export default function Document(props: DocProps) {
  const router = useRouter();
  const [title, setTitle] = useState(props.document.data[0].title);
  const [description, setDescription] = useState(props.document.data[0].description);
  const [alert, setAlert] = useState("");
  const [error, setError] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState(false);
  const desc = "Update your document";

  async function submitForm() {
    const url = `/api/documents/${props.document.data[0].id}`;
    try {
      setSubmitting(true);
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
        }),
      });
      //Check for ok response
      if (!response.ok) {
        //Throw error if not ok
        throw Error(response.statusText);
      }
      router.push("/documents");
      setSubmitting(false);
    } catch (err) {
      setSubmitting(false);
      setError(true);
    }
  }

  if (error) {
    router.push("/500");
  }

  if (submitting) {
    return <Loading />;
  }

  return (
    <Protected>
      <div className="py-3">
        <PageTitle title="Document" description={desc} image="/img/docs.jpg" alt="Users in a theatre" />
        <div className="flex justify-center py-5 px-5 md:px-10 lg:px-16">
          <div>
            {alert ? (
              <div className="py-3">
                <Alert text={alert} close={setAlert} />
              </div>
            ) : (
              ""
            )}
            <form id="update" onSubmit={submitForm} className="py-8 space-y-5 text-coal dark:text-salt">
              <input
                type="text"
                value={title}
                className="w-full px-6 py-3 rounded-md focus:outline-none bg-transparent border-coal dark:border-salt border"
                placeholder="Title"
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                rows={5}
                className="w-full px-6 py-3 rounded-md focus:outline-none bg-transparent border-coal dark:border-salt border"
                placeholder="Description"
                onChange={(e) => setDescription(e.target.value)}
              />
            </form>
            <div className="flex items-center justify-between">
              <div
                onClick={() => {
                  submitForm();
                }}
              >
                <Button form="update" type="submit">
                  Update
                </Button>
              </div>
              <a href="/documents">
                <Button color="bg-coal dark:bg-salt" text="text-salt dark:text-coal" disabled>
                  Cancel
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </Protected>
  );
}

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
  const document = await getSingleDoc(context);
  // Have to stringify then parse otherwise date objects cannot be passed to page
  const stringify = JSON.stringify(document);
  const parsed = JSON.parse(stringify);
  return {
    props: { document: parsed }, // will be passed to the page component as props
  };
};

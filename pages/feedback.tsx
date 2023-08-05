import { useState } from "react";
import PageFrame from "@/components/PageFrame";
import { User } from "@/lib/schema";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import { useLoadingContext } from "@/lib/LoadingContext";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import FormError from "@/components/FormError";

export default function Feedback(props: { profile: User }) {
  const router = useRouter();
  const { setLoading } = useLoadingContext();
  const [error, setError] = useState(false);
  const [feedback, setFeedback] = useState({});

  async function submit(e: any) {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(`/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedback),
      });
      //Check for ok response
      if (!response.ok) {
        //Throw error if not ok
        throw Error(response.statusText);
      }
      router.push("/");
      setLoading(false);
    } catch (error) {
      console.log(error);

      setLoading(false);
      setError(true);
    }
  }

  return (
    <PageFrame title="Feedback">
      <div className="py-4">
        <h1 className="text-2xl">Feedback</h1>
        <h2 className="text-sm text-zinc-500 dark:text-zinc-300 italic">
          Request changes, provide feedback or report a bug
        </h2>
      </div>
      <div className="w-full lg:w-2/3 flex justify-center py-2">
        {error ? (
          <FormError reset={setError} />
        ) : (
          <form
            onSubmit={(e) => submit(e)}
            className="w-full flex flex-col justify-center items-center gap-2"
          >
            <div className="w-full">
              <Label>Summary:</Label>
              <Input
                className="my-2"
                type="text"
                placeholder="Summary"
                onChange={(e) => setFeedback({ ...feedback, title: e.target.value })}
              />
            </div>
            <div className="w-full">
              <Label>Details:</Label>
              <Textarea
                className="my-2"
                placeholder="Provide details..."
                onChange={(e) => setFeedback({ ...feedback, body: e.target.value })}
              />
            </div>
            <div className="flex justify-between w-full py-5">
              <Button asChild variant="secondary">
                <Link href="/">Cancel</Link>
              </Button>
              <Button type="submit">Submit</Button>
            </div>
          </form>
        )}
      </div>
    </PageFrame>
  );
}

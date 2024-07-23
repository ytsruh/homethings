import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import PageTitle from "@/components/PageTitle";
import PageHeader from "@/components/PageHeader";
import Loading from "@/components/Loading";
import { useMutation } from "@tanstack/react-query";
import { getToken } from "@/lib/utils";

type FeedbackResponse = {
  message: string;
  data: object;
};

type FeedbackInput = {
  title: string;
  body: string;
};

export default function Feedback() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const mutation = useMutation<FeedbackResponse, Error, FeedbackInput>({
    mutationFn: async (input) => {
      const response = await fetch("/api/feedback", {
        method: "POST",
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
      toast({
        title: "Success",
        description: "Your feedback has been submitted successfully.",
      });
      navigate("/feedback", { replace: true });
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
    const fields = Object.fromEntries(
      new FormData(e.target as HTMLFormElement),
    );
    if (!fields.title || !fields.body) {
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Please fill in all fields",
      });
      return;
    }
    console.log(fields);
    mutation.mutate({
      title: fields.title as string,
      body: fields.body as string,
    });
  }

  if (mutation.isPending) {
    return <Loading />;
  }

  return (
    <>
      <PageTitle title="Feedback | Homethings" />
      <PageHeader
        title="Feedback"
        subtitle="Request changes, provide feedback or report a bug"
      />
      <div className="w-full lg:w-2/3 flex justify-center py-2">
        <form
          onSubmit={(e) => submit(e)}
          className="w-full flex flex-col justify-center items-center gap-2"
        >
          <div className="w-full">
            <Label>Summary:</Label>
            <Input
              className="my-2"
              name="title"
              type="text"
              placeholder="Summary / Title"
            />
          </div>
          <div className="w-full">
            <Label>Details:</Label>
            <Textarea
              className="my-2"
              name="body"
              placeholder="Provide details..."
            />
          </div>
          <div className="flex justify-end w-full py-5">
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </div>
    </>
  );
}

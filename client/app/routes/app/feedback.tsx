import type { Route } from "./+types/feedback";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import PageHeader from "~/components/PageHeader";
import { redirect, useFetcher } from "react-router";
import { Button } from "~/components/ui/button";
import { pb } from "~/lib/utils";
import { toast } from "~/components/Toaster";
import { ZodError } from "zod";
import { Textarea } from "~/components/ui/textarea";
import { useRef, useEffect } from "react";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Feedback" }, { name: "description", content: "Please give your feedback" }];
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  try {
    const formData = await request.formData();
    const title = formData.get("title");
    const body = formData.get("body");
    const user = pb.authStore.record;
    if (!user) {
      pb.authStore.clear();
      return redirect("/login");
    }
    if (!title || !body) {
      toast({
        description: "Please fill in all fields",
        title: "Feedback not submitted",
        type: "destructive",
      });
      return { ok: false, error: "Please fill in all fields" };
    }
    const data = {
      title: title as string,
      body: body as string,
      createdBy: user?.id as string,
    };
    await pb.collection("feedback").create(data);
    toast({
      description: "Feedback submitted",
      title: "Success",
    });
    return { ok: true, error: null };
  } catch (error) {
    if (error instanceof ZodError) {
      toast({
        description: error.errors[0].message,
        title: "Feedback not submitted",
        type: "destructive",
      });
      return { ok: false, error: error.errors[0].message };
    }
    return { ok: false, error: error as string };
  }
}

export default function Feedback() {
  const fetcher = useFetcher();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.ok) {
      formRef.current?.reset();
    }
  }, [fetcher.state, fetcher.data]);

  const handleSubmit = () => {
    if (formRef.current) {
      const formData = new FormData(formRef.current);
      fetcher.submit(formData, { method: "post" });
    }
  };

  return (
    <>
      <PageHeader title="Feedback" subtitle="Please give your feedback" />
      <fetcher.Form
        ref={formRef}
        method="post"
        className="flex flex-col w-full max-w-xl items-center gap-4 py-2"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}>
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="title">Title</Label>
          <Input name="title" placeholder="Title" />
        </div>
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="body">Body</Label>
          <Textarea name="body" placeholder="Body" />
        </div>
        <div className="flex w-full justify-end gap-1.5">
          <Button type="submit">Submit</Button>
        </div>
      </fetcher.Form>
    </>
  );
}

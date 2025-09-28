import { redirect, useRevalidator } from "react-router";
import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { pb } from "~/lib/utils";
import { toast } from "../Toaster";
import { LoadingSpinner } from "../LoadingSpinner";

export function NewFile(props: { noteId: string }) {
  const revalidator = useRevalidator();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!loading && success) {
      setOpen(false);
      formRef.current?.reset();
      revalidator.revalidate();
      setSuccess(false);
    }
  }, [loading, success, revalidator]);

  const handleSubmit = async () => {
    if (formRef.current) {
      try {
        setLoading(true);
        const formData = new FormData(formRef.current);
        const name = formData.get("name");
        const file = formData.get("file");
        const noteId = formData.get("noteId");
        const user = pb.authStore.record;
        if (!user) {
          pb.authStore.clear();
          return redirect("/login");
        }
        if (!name || !file || !noteId) {
          toast({
            description: "Please fill in all fields",
            title: "Name and File are required",
            type: "destructive",
          });
          setLoading(false);
          setSuccess(false);
        }
        const createdFile = await pb.collection("files").create({
          name: name as string,
          file: file as File,
        });
        await pb
          .collection("notes")
          .update(noteId as string, { "files+": [createdFile.id] });
        toast({
          description: "File uploaded successfully",
          title: "Success",
        });
        setSuccess(true);
        setLoading(false);
      } catch (error) {
        console.log(error);
        toast({
          description: "An error occurred while uploading the file",
          title: "Error",
          type: "destructive",
        });
        setLoading(false);
        setSuccess(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add</Button>
      </DialogTrigger>
      <DialogContent aria-describedby="add-file">
        <form
          ref={formRef}
          autoComplete="off"
          method="post"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>Upload a file</DialogTitle>
          </DialogHeader>
          <DialogDescription></DialogDescription>
          <div className="flex flex-col space-y-5 my-5">
            <div className="grid w-full gap-2">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input name="name" placeholder="File name" className="w-full" />
            </div>
            <div className="grid w-full gap-2">
              <Label htmlFor="file" className="text-right">
                File
              </Label>
              <Input name="file" type="file" className="w-full" />
            </div>
            <input
              readOnly
              name="noteId"
              value={props.noteId}
              className="hidden"
            />
          </div>
          <DialogFooter>
            {!loading ? (
              <Button type="submit">Upload</Button>
            ) : (
              <LoadingSpinner />
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

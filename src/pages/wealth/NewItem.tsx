import PageTitle from "@/components/PageTitle";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { getToken } from "@/lib/utils";

type CreateWealthResponse = {
  message: string;
  data: object;
};

type WealthInput = {
  name: string;
  type: string;
  url: string;
  notes: string;
};

export default function WealthNewItem() {
  const navigate = useNavigate();

  const mutation = useMutation<CreateWealthResponse, Error, WealthInput>({
    mutationFn: async (input) => {
      const response = await fetch("/api/wealth", {
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
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your new wealth item has been created successfully.",
      });
      navigate("/wealth", { replace: true });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Something went wrong. Please try again.",
      });
    },
  });

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fields = Object.fromEntries(new FormData(e.target as HTMLFormElement));
    if (!fields.name || !fields.type) {
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Please fill in all fields",
      });
      return;
    }
    mutation.mutate({
      name: fields.name as string,
      type: fields.type as string,
      url: (fields.url as string) || "",
      notes: (fields.notes as string) || "",
    });
  }

  return (
    <>
      <PageTitle title="Wealth | Homethings" />
      <PageHeader
        title="Create New Wealth Item"
        subtitle="Add a new asset or liability to your wealth tracker"
      />
      <div className="w-full flex items-center justify-center py-2">
        <form
          onSubmit={(e) => submit(e)}
          className="w-full lg:w-1/2 flex flex-col justify-center items-center gap-2 py-5">
          <div className="w-full">
            <Label>Name:</Label>
            <Input className="my-2" name="name" type="text" placeholder="Name" />
          </div>
          <div className="w-full">
            <Label>Type:</Label>
            <div className="my-2">
              <Select name="type">
                <SelectTrigger>
                  <SelectValue placeholder="Choose asset / liability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asset">Asset</SelectItem>
                  <SelectItem value="liability">Liability</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="w-full">
            <Label>Link:</Label>
            <Input className="my-2" name="link" type="text" placeholder="Link to asset (optional)" />
          </div>
          <div className="w-full">
            <Label>Notes:</Label>
            <Textarea className="my-2" name="notes" placeholder="Notes (optional)" rows={5} />
          </div>
          <div className="flex justify-between w-full py-5">
            <Button variant="secondary" asChild>
              <Link to="/wealth">Cancel</Link>
            </Button>
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </div>
    </>
  );
}

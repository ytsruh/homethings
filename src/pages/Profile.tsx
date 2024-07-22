import { useLoaderData, useNavigate } from "react-router-dom";
import { ProfileData } from "@/types";
import PageTitle from "@/components/PageTitle";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import {
  getToken,
  queryClient,
  getLocalPreferences,
  setLocalPreferences,
} from "@/lib/utils";
import Loading from "@/components/Loading";

type ProfileResponse = {
  message: string;
};

type ProfileInput = {
  name: string;
  showBooks: boolean;
  showDocuments: boolean;
};

export default function Profile() {
  const data = useLoaderData() as ProfileData;
  const { toast } = useToast();
  const navigate = useNavigate();

  const mutation = useMutation<ProfileResponse, Error, ProfileInput>({
    mutationFn: async (input) => {
      const response = await fetch("/api/profile", {
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
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({
        title: "Success",
        description: "Your profile has been updated successfully.",
      });
      const savedPreferences = getLocalPreferences();
      setLocalPreferences({
        ...savedPreferences,
        name: variables.name,
        showBooks: variables.showBooks,
        showDocuments: variables.showDocuments,
      });
      navigate("/profile", { replace: false });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Something went wrong. Please try again.",
      });
    },
  });
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fields = Object.fromEntries(
      new FormData(e.target as HTMLFormElement),
    );

    if (!fields.name) {
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Please fill in all fields",
      });
      return;
    }
    mutation.mutate({
      name: fields.name as string,
      showBooks: fields.showBooks === "on",
      showDocuments: fields.showDocuments === "on",
    });
  }

  if (mutation.isPending) {
    return <Loading />;
  }

  return (
    <>
      <PageTitle title="Profile | Homethings" />
      <div>
        <PageHeader
          title="Profile"
          subtitle="Change your profile picture or show/hide features to personalise your experience."
        />
        <form
          className="w-full flex flex-col justify-center items-center gap-2"
          onSubmit={handleSubmit}
        >
          <div className="w-full">
            <Label>Name:</Label>
            <Input
              className="my-2"
              type="text"
              placeholder="Name"
              name="name"
              defaultValue={data.name}
            />
          </div>
          <div className="w-full">
            <Label>Email:</Label>
            <Input className="my-2" type="text" value={data.email} disabled />
          </div>
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10">
            <div className="w-full flex justify-between items-center">
              <div>
                <Label>Show Documents:</Label>
              </div>
              <Switch
                name="showDocuments"
                defaultChecked={data.showDocuments || false}
              />
            </div>
            <div className="w-full flex justify-between items-center">
              <div>
                <Label>Show Books:</Label>
              </div>
              <Switch
                name="showBooks"
                defaultChecked={data.showBooks as boolean}
              />
            </div>
          </div>
          <div className="flex justify-end w-full py-5">
            <Button type="submit">Update</Button>
          </div>
        </form>
      </div>
    </>
  );
}

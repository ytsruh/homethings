import { useState } from "react";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import PageFrame from "@/components/PageFrame";
import { getProfile } from "pages/api/profile";
import { User } from "@/lib/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/router";
import { useLoadingContext } from "@/lib/LoadingContext";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import FormError from "@/components/FormError";

export default function Profile(props: { profile: User }) {
  const router = useRouter();
  const { setLoading } = useLoadingContext();
  const [error, setError] = useState(false);
  const [profile, setProfile] = useState(props.profile);

  async function submit(e: any) {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(`/api/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      //Check for ok response
      if (!response.ok) {
        //Throw error if not ok
        throw Error(response.statusText);
      }
      router.push("/");
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
      setError(true);
    }
  }

  return (
    <PageFrame title="Documents">
      <div className="py-4">
        <h1 className="text-2xl">Profile & Settings</h1>
        <h2 className="text-sm text-zinc-500 dark:text-zinc-300 italic">
          Change your profile picture or show/hide features to personalise your experience.
        </h2>
      </div>
      <div className="w-full flex justify-center py-2">
        {error ? (
          <FormError reset={setError} />
        ) : (
          <form
            onSubmit={(e) => submit(e)}
            className="w-full flex flex-col justify-center items-center gap-2"
          >
            <div className="w-full">
              <Label>Name:</Label>
              <Input
                className="my-2"
                type="text"
                placeholder="Filename"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
            <div className="w-full">
              <Label>Email:</Label>
              <Input className="my-2" type="text" value={profile.email} disabled />
            </div>
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10">
              <div className="w-full flex justify-between items-center">
                <div>
                  <Label>Show Documents:</Label>
                </div>
                <Switch
                  checked={profile.showDocuments}
                  onCheckedChange={(bool) => setProfile({ ...profile, showDocuments: bool })}
                />
              </div>
              <div className="w-full flex justify-between items-center">
                <div>
                  <Label>Show Books:</Label>
                </div>
                <Switch
                  checked={profile.showBooks}
                  onCheckedChange={(bool) => setProfile({ ...profile, showBooks: bool })}
                />
              </div>
            </div>
            <div className="flex justify-between w-full py-5">
              <Button asChild variant="secondary">
                <Link href="/documents">Cancel</Link>
              </Button>
              <Button type="submit">Update</Button>
            </div>
          </form>
        )}
      </div>
    </PageFrame>
  );
}

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
  const profile = await getProfile(context);
  // Have to stringify then parse otherwise date objects cannot be passed to page
  const stringify = JSON.stringify(profile);
  const parsed = JSON.parse(stringify);
  return {
    props: { profile: parsed }, // will be passed to the page component as props
  };
};

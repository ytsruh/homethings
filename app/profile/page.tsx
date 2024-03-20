"use client";
import { useEffect, useState } from "react";
import PageFrame from "@/components/PageFrame";
import type { User } from "@/db/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import Loading from "@/components/Loading";
import { useRouter } from "next/navigation";
import { useLoadingContext } from "@/lib/LoadingContext";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import FormError from "@/components/FormError";
import { setLocalUser } from "@/lib/utils";

export default function Profile() {
  const router = useRouter();
  const { loading, setLoading } = useLoadingContext();
  const [loaded, setLoaded] = useState(loading);
  const [error, setError] = useState(false);
  const [profile, setProfile] = useState<User>();

  useEffect(() => {
    async function getData() {
      const res = await fetch("/api/profile");
      if (!res.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await res.json();
      setProfile(data);
      setLoaded(true);
    }
    getData();
  }, []);

  async function submit(e: any) {
    e.preventDefault();
    try {
      if (!profile) {
        return;
      }
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
      setLocalUser({
        name: profile.name,
        email: profile.email,
        showDocuments: profile.showDocuments,
        showBooks: profile.showBooks,
      } as User);
      router.push("/");
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(true);
    }
  }

  if (!loaded) {
    return <Loading />;
  }

  if (profile) {
    return (
      <PageFrame title="Profile">
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
              className="w-full flex flex-col justify-center items-center gap-2">
              <div className="w-full">
                <Label>Name:</Label>
                <Input
                  className="my-2"
                  type="text"
                  placeholder="Filename"
                  value={profile.name as string}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>
              <div className="w-full">
                <Label>Email:</Label>
                <Input className="my-2" type="text" value={profile.email as string} disabled />
              </div>
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10">
                <div className="w-full flex justify-between items-center">
                  <div>
                    <Label>Show Documents:</Label>
                  </div>
                  <Switch
                    checked={profile.showDocuments || false}
                    onCheckedChange={(bool) => setProfile({ ...profile, showDocuments: bool })}
                  />
                </div>
                <div className="w-full flex justify-between items-center">
                  <div>
                    <Label>Show Books:</Label>
                  </div>
                  <Switch
                    checked={profile.showBooks as boolean}
                    onCheckedChange={(bool) => setProfile({ ...profile, showBooks: bool })}
                  />
                </div>
              </div>
              <div className="flex justify-between w-full py-5">
                <Button asChild variant="secondary">
                  <Link href="/">Cancel</Link>
                </Button>
                <Button type="submit">Update</Button>
              </div>
            </form>
          )}
        </div>
      </PageFrame>
    );
  }
}

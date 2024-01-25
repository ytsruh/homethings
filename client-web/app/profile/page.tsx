"use client";
import { useEffect, useState } from "react";
import PageFrame from "@/components/PageFrame";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import Loading from "@/components/Loading";
import { useRouter } from "next/navigation";
import { useLoadingContext } from "@/lib/LoadingContext";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import FormError from "@/components/FormError";
import { getLocalToken, setLocalUser } from "@/lib/utils";

export default function Profile() {
  const router = useRouter();
  const { loading, setLoading } = useLoadingContext();
  const [error, setError] = useState(false);
  const [profile, setProfile] = useState<any>();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    async function getData() {
      const token = await getLocalToken();
      try {
        const res = await fetch(`${baseUrl}/profile`, {
          headers: {
            Authorization: token as string,
          },
        });
        if (res.status === 401) {
          throw Error("unauthorized");
        }
        const data = await res.json();
        setProfile(data);
        setLoading(false);
      } catch (error: any) {
        if (error.message === "unauthorized") {
          router.push("/login");
        }
        console.log(error);
      }
    }
    getData();
  }, []);

  async function submit(e: any) {
    e.preventDefault();
    try {
      if (!profile) {
        return;
      }
      const token = await getLocalToken();
      setLoading(true);
      const res = await fetch(`${baseUrl}/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token as string,
        },
        body: JSON.stringify(profile),
      });
      //Check for ok response
      if (res.status === 401) {
        throw Error("unauthorized");
      }
      setLocalUser({
        name: profile.name,
        email: profile.email,
        showDocuments: profile.showDocuments,
        showBooks: profile.showBooks,
      });
      router.push("/");
      setLoading(false);
    } catch (error: any) {
      if (error.message === "unauthorized") {
        router.push("/login");
      }
      setLoading(false);
      setError(true);
    }
  }

  if (loading) {
    return <Loading />;
  }

  if (profile) {
    return (
      <PageFrame title="Profile">
        <div className="py-4">
          <h1 className="text-2xl">Profile & Settings</h1>
          <h2 className="text-sm italic text-zinc-500 dark:text-zinc-300">
            Change your profile picture or show/hide features to personalise
            your experience.
          </h2>
        </div>
        <div className="flex w-full justify-center py-2">
          {error ? (
            <FormError reset={setError} />
          ) : (
            <form
              onSubmit={(e) => submit(e)}
              className="flex w-full flex-col items-center justify-center gap-2"
            >
              <div className="w-full">
                <Label>Name:</Label>
                <Input
                  className="my-2"
                  type="text"
                  placeholder="Filename"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                />
              </div>
              <div className="w-full">
                <Label>Email:</Label>
                <Input
                  className="my-2"
                  type="text"
                  value={profile.email}
                  disabled
                />
              </div>
              <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2 md:gap-10">
                <div className="flex w-full items-center justify-between">
                  <div>
                    <Label>Show Documents:</Label>
                  </div>
                  <Switch
                    checked={profile.showDocuments || false}
                    onCheckedChange={(bool) =>
                      setProfile({ ...profile, showDocuments: bool })
                    }
                  />
                </div>
                <div className="flex w-full items-center justify-between">
                  <div>
                    <Label>Show Books:</Label>
                  </div>
                  <Switch
                    checked={profile.showBooks}
                    onCheckedChange={(bool) =>
                      setProfile({ ...profile, showBooks: bool })
                    }
                  />
                </div>
              </div>
              <div className="flex w-full justify-between py-5">
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

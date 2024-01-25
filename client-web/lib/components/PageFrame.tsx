"use client";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import Loading from "./Loading";
import MainNav from "./MainNav";
import { getLocalUser } from "@/lib/utils";

export default function PageFrame(props: { title: string; children: React.ReactNode }) {
  const router = useRouter();
  const [preferences, setPreferences] = useState<any>({});
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    async function updatePreferences() {
      const pref = await getLocalUser();
      setPreferences(pref);
    }
    updatePreferences();
    async function checkAuth() {
      const token = await sessionStorage.getItem("token");
      if (token) {
        setStatus("authenticated");
      } else {
        setStatus("unauthenticated");
        router.push("/login");
      }
    }
    checkAuth();
  }, []);

  if (status === "authenticated") {
    return (
      <div>
        <MainNav preferences={preferences} />
        <div className="mx-5 my-2">
          <div className="py-2">
            <h2 className="text-3xl font-bold tracking-tight py-2">{props.title}</h2>
            <Separator />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="hidden lg:grid lg:col-span-2 p-2">
              <div className="flex flex-col mt-2 space-y-3">
                <SideLink text="Home" link="/" />
                {preferences.showDocuments && <SideLink text="Documents" link="/documents" />}
                {preferences.showBooks && <SideLink text="Books" link="/books" />}
                <SideLink text="Profile" link="/profile" />
              </div>
            </div>
            <div className="col-span-12 lg:col-span-10 p-2">{props.children}</div>
          </div>
        </div>
      </div>
    );
  }

  return <Loading />;
}

function SideLink(props: { text: string; link: string }) {
  return (
    <a
      className="hover:bg-zinc-800 rounded-md px-1 py-2 hover:cursor-pointer hover:text-white"
      href={props.link}>
      {props.text}
    </a>
  );
}

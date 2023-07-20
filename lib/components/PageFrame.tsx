import React from "react";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Loading from "./Loading";
import MainNav from "./MainNav";

export default function PageFrame(props: { title: string; children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <Loading />;
  }
  if (status === "authenticated") {
    return (
      <div>
        <MainNav />
        <div className="mx-5 my-2">
          <div className="py-2">
            <h2 className="text-3xl font-bold tracking-tight py-2">{props.title}</h2>
            <Separator />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="hidden lg:grid lg:col-span-2 p-2">
              <div className="flex flex-col mt-2 space-y-3">
                <SideLink text="Home" link="/" />
                <SideLink text="Books" link="/books" />
                <SideLink text="Documents" link="/documents" />
                <SideLink text="Profile" link="/profile" />
              </div>
            </div>
            <div className="col-span-12 lg:col-span-10 p-2">{props.children}</div>
          </div>
        </div>
      </div>
    );
  }
  if (status === "unauthenticated") {
    router.push("/login");
  }

  return <Loading />;
}

function SideLink(props: { text: string; link: string }) {
  return (
    <a
      className="hover:bg-zinc-800 rounded-md px-1 py-2 hover:cursor-pointer hover:text-white"
      href={props.link}
    >
      {props.text}
    </a>
  );
}

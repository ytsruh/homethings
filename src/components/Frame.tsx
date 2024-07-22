import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import { useLocation, useNavigation, Link } from "react-router-dom";
import MainNav from "./MainNav";
import { getLocalPreferences } from "@/lib/utils";
import { Toaster } from "./ui/toaster";
import { AppPreferences } from "@/types";
import Loading from "@/components/Loading";

type PageProps = {
  children: React.ReactNode;
};

const defaultPreferences = {
  showDocuments: true,
  showBooks: true,
  profileImage: "",
  name: "",
  email: "",
};

export default function PageFrame(props: PageProps) {
  const navigation = useNavigation();
  const [preferences, setPreferences] =
    useState<AppPreferences>(defaultPreferences);

  useEffect(() => {
    const preferences: AppPreferences = getLocalPreferences();
    setPreferences(preferences);
  }, [navigation]);

  return (
    <div className="min-h-screen flex flex-col h-screen">
      <MainNav preferences={preferences} />
      <div className="px-5 py-2 flex flex-col h-full">
        <BreadcrumbNavigation />
        <Separator />
        <div id="app" className="flex-1 flex">
          <div className="hidden lg:flex lg:flex-col lg:p-2 lg:w-56 lg:space-y-3">
            <SideLink text="Home" link="/" />
            <SideLink text="Chat" link="/chat" />
            <SideLink text="Notes" link="/notes" />
            {preferences.showDocuments && (
              <SideLink text="Documents" link="/documents" />
            )}
            {preferences.showBooks && <SideLink text="Books" link="/books" />}
            <SideLink text="Profile" link="/profile" />
          </div>
          <div className="p-2 w-full">
            {navigation.state === "loading" ? <Loading /> : props.children}
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

function SideLink(props: { text: string; link: string }) {
  return (
    <Link
      className="hover:bg-zinc-800 rounded-md px-1 py-2 hover:cursor-pointer hover:text-white"
      to={props.link}
    >
      {props.text}
    </Link>
  );
}

function BreadcrumbNavigation() {
  let location = useLocation();
  return (
    <div className="my-3 ml-3">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          {location.pathname !== "/" && (
            <>
              <BreadcrumbSeparator>
                <ChevronRightIcon />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink href={location.pathname} className="capitalize">
                  {location.pathname.slice(1)}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}

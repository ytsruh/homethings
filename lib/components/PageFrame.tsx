import { Separator } from "@/components/ui/separator";
import MainNav from "./MainNav";
import { Toaster } from "./ui/toaster";

export default function PageFrame(props: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col h-screen">
      <MainNav />
      <div className="px-5 py-2 flex flex-col h-full">
        <div>
          <h2 className="text-3xl font-bold tracking-tight py-2">{props.title}</h2>
          <Separator />
        </div>
        <div id="app" className="flex-1 flex">
          <div className="hidden lg:flex lg:flex-col lg:p-2 lg:w-56 lg:space-y-3">
            <SideLink text="Home" link="/" />
            <SideLink text="Chat" link="/chat" />
            <SideLink text="Notes" link="/notes" />
            <SideLink text="Documents" link="/documents" />
            <SideLink text="Books" link="/books" />
            <SideLink text="Profile" link="/profile" />
          </div>
          <div className="p-2 w-full">{props.children}</div>
        </div>
      </div>
      <Toaster />
    </div>
  );
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

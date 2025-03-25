import { Link, Outlet, useNavigate } from "react-router";
import { useEffect } from "react";
import PocketBase from "pocketbase";
import { useLocation } from "react-router";
import { SidebarProvider } from "~/components/ui/sidebar";
import { Navbar } from "~/components/Navbar";
import { Separator } from "~/components/ui/separator";
import { BreadcrumbNav } from "~/components/BreadcrumbNav";

const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);

export default function AppLayout() {
  let location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const loggedIn = pb.authStore.isValid;
    if (!loggedIn) {
      navigate("/login");
    }
  }, [location, navigate]);

  return (
    <SidebarProvider defaultOpen={false}>
      <main className="min-h-screen w-full flex flex-col">
        <Navbar />
        <div className="px-5 py-2 flex flex-col h-full">
          <BreadcrumbNav />
          <Separator />
          <div className="flex">
            <div className="hidden lg:flex lg:flex-col lg:p-2 lg:w-56 lg:space-y-3">
              <Link
                className="hover:bg-zinc-800 text-sm rounded-md px-2 py-2 hover:cursor-pointer hover:text-white"
                to="/">
                Home
              </Link>
              <Link
                className="hover:bg-zinc-800 text-sm rounded-md px-2 py-2 hover:cursor-pointer hover:text-white"
                to="/chat">
                Chat
              </Link>
              <Link
                className="hover:bg-zinc-800 text-sm rounded-md px-2 py-2 hover:cursor-pointer hover:text-white"
                to="/tasks">
                Tasks
              </Link>
              <Link
                className="hover:bg-zinc-800 text-sm rounded-md px-2 py-2 hover:cursor-pointer hover:text-white"
                to="/notes">
                Notes
              </Link>
              <Link
                className="hover:bg-zinc-800 text-sm rounded-md px-2 py-2 hover:cursor-pointer hover:text-white"
                to="/books">
                Books
              </Link>
              <Link
                className="hover:bg-zinc-800 text-sm rounded-md px-2 py-2 hover:cursor-pointer hover:text-white"
                to="/profile">
                Profile
              </Link>
            </div>
            <div className="p-2 w-full">
              <Outlet />
            </div>
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}

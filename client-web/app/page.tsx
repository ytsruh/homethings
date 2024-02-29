"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Loading from "@/components/Loading";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useRouter } from "next/navigation";
import NavBar from "@/components/Navbar";

export default function Page() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [random, setRandom] = useState("0");
  const [search, setSearch] = useState("");
  useEffect(() => {
    document.title = "Welcome to the Playground | Homethings";
    const pageDescription = document.createElement("meta");
    pageDescription.name = "description";
    pageDescription.content =
      "Homethings is a personal playground. It contains a custom built search engine & a bunch of mini apps. It's a place for me to experiment with new technologies and ideas.";
    document.head.appendChild(pageDescription);
    setRandom(Math.random().toFixed(5).substring(2, 9));
    setLoading(false);
  }, []);

  if (loading) {
    return <Loading />;
  }

  function handleSubmit() {
    if (search.length > 0) {
      setLoading(true);
      router.push(`/search?q=${search}`);
      return;
    }
    toast({
      variant: "destructive",
      title: "Something went wrong",
      description: "Please enter a search term",
    });
    return;
  }

  return (
    <div className="flex flex-col h-screen w-full">
      <NavBar />
      <div className="flex flex-col justify-center items-center h-full w-full">
        <div className="w-full md:w-1/2 px-10 text-center">
          <h1 className="py-2 text-5xl">
            Welcome to <span className="text-accent">Homethings</span> Search
          </h1>
          <h2 className="py-2 text-xl">Search 0.0000{random}% of the web</h2>
          <div className="space-y-5 py-5">
            <input
              id="search-input"
              type="search"
              className="w-full rounded-md border bg-transparent px-6 py-3 focus:outline-none"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="mt-6 flex items-center justify-between space-y-6 md:space-y-0">
              <Button form="login-form" onClick={handleSubmit}>
                Search
              </Button>
              {search.length > 0 && (
                <Button variant="secondary" onClick={() => setSearch("")}>
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

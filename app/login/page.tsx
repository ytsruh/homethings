"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { ToggleTheme } from "@/components/ToggleTheme";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import Loading from "@/components/Loading";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { setLocalUser } from "@/lib/utils";

export default function Page() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const submitForm = async (e: any) => {
    try {
      e.preventDefault();
      const email = e.target[0].value;
      const password = e.target[1].value;
      if (email == "" || password == "") {
        toast({
          variant: "destructive",
          title: "Something went wrong",
          description: "Please ensure that email & password are both set",
        });
        return;
      }
      setSubmitting(true);
      // Pass credentials to NextAuth & login
      const result = await signIn("credentials", {
        email: email,
        password: password,
        redirect: false,
      });
      if (result?.ok) {
        const res = await fetch(`/api/profile`);
        //Check for ok response
        if (!res.ok) {
          //Throw error if not ok
          throw Error(res.statusText);
        }
        const profile = await res.json();
        await setLocalUser(profile);
        router.push("/");
      }
    } catch (error) {
      console.log(error);
      setSubmitting(false);
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: error as string,
      });
    }
  };

  if (submitting) {
    return <Loading />;
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="relative flex flex-col m-6 space-y-10 shadow-2xl rounded-2xl md:flex-row md:space-y-0 md:m-0 dark:bg-zinc-900">
        <div className="p-6 md:p-20">
          <div className="text-center py-5">
            <h1 className="text-5xl py-2">
              Welcome to <span className="text-accent">Homethings</span>
            </h1>
            <h6 className="text-xl py-2">Login to view awesome things</h6>
          </div>
          <form id="login-form" onSubmit={submitForm} className="py-5 space-y-5">
            <input
              type="email"
              className="w-full px-6 py-3 rounded-md focus:outline-none bg-transparent border"
              placeholder="Email"
            />
            <input
              type="password"
              className="w-full px-6 py-3 rounded-md focus:outline-none bg-transparent border"
              placeholder="Password"
            />
            <div className="flex flex-col items-center justify-between mt-6 space-y-6 md:flex-row md:space-y-0">
              <Button form="login-form" type="submit">
                Login
              </Button>
              <ToggleTheme />
            </div>
          </form>
        </div>

        <img src="img/login.webp" alt="" className="w-96 hidden lg:block rounded-r-2xl" />
      </div>
      <Toaster />
    </div>
  );
}

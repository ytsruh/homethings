"use client";
import { useState } from "react";
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
      const loginRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        },
      );
      //Check for ok response
      if (loginRes.status !== 200) {
        throw Error("unauthorized");
      }
      const loginData = await loginRes.json();
      sessionStorage.setItem("token", loginData.token);
      await setLocalUser(loginData.profile);
      router.push("/");
    } catch (error) {
      console.log(error);
      setSubmitting(false);
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Please ensure that email & password are both correct",
      });
    }
  };

  if (submitting) {
    return <Loading />;
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="relative m-6 flex flex-col space-y-10 rounded-2xl shadow-2xl md:m-0 md:flex-row md:space-y-0 dark:bg-zinc-900">
        <div className="p-6 md:p-20">
          <div className="py-5 text-center">
            <h1 className="py-2 text-5xl">
              Welcome to <span className="text-accent">Homethings</span>
            </h1>
            <h6 className="py-2 text-xl">Login to view awesome things</h6>
          </div>
          <form
            id="login-form"
            onSubmit={submitForm}
            className="space-y-5 py-5"
          >
            <input
              type="email"
              className="w-full rounded-md border bg-transparent px-6 py-3 focus:outline-none"
              placeholder="Email"
            />
            <input
              type="password"
              className="w-full rounded-md border bg-transparent px-6 py-3 focus:outline-none"
              placeholder="Password"
            />
            <div className="mt-6 flex flex-col items-center justify-between space-y-6 md:flex-row md:space-y-0">
              <Button form="login-form" type="submit">
                Login
              </Button>
              <ToggleTheme />
            </div>
          </form>
        </div>

        <img
          src="img/login.webp"
          alt=""
          className="hidden w-96 rounded-r-2xl lg:block"
        />
      </div>
      <Toaster />
    </div>
  );
}

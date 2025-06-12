import type { Route } from "./+types/login";
import { useFetcher, redirect } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { loginForm } from "~/lib/schema";
import { ZodError } from "zod";
import { toast } from "~/components/Toaster";
import { ModeToggle } from "~/components/theme-toggle";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { pb } from "~/lib/utils";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Login to Homethings" },
    { name: "description", content: "Login to view awesome things" },
  ];
}

export async function clientAction({ request }: Route.ActionArgs) {
  try {
    // Get & parse the form data
    let formData = await request.formData();
    let email = formData.get("email");
    let password = formData.get("password");
    loginForm.parse({ email: email as string, password: password as string });
    const userData = await pb
      .collection("users")
      .authWithPassword(email as string, password as string);
    if (userData) {
      toast({
        title: "Success",
        description: "You have successfully logged in",
      });
      return redirect("/app");
    }
    toast({
      title: "Login error",
      description: "Please check your email and password",
      type: "destructive",
    });
    return;
  } catch (error) {
    if (error instanceof ZodError) {
      toast({
        description: error.errors[0].message,
        title: "Login error",
        type: "destructive",
      });
      return { ok: false, error: error.errors[0].message };
    }
    toast({
      title: "Login error",
      description: "Please check your email and password",
      type: "destructive",
    });
    return;
  }
}

export default function Login() {
  const fetcher = useFetcher();

  return (
    <div className="flex flex-col items-center justify-center h-screen max-h-screen">
      <div className="flex flex-col m-6 space-y-10 shadow-2xl rounded-2xl md:flex-row md:space-y-0 md:m-0 dark:bg-zinc-900">
        <div className="p-6 md:p-20">
          <div className="py-5">
            <h1 className="text-5xl text-center py-2">
              Welcome to <span className="text-theme">Homethings</span>
            </h1>
            <h2 className="text-2xl text-center py-2">
              Login to view awesome things
            </h2>
            <fetcher.Form
              className="flex flex-col gap-y-5 w-full"
              autoComplete="off"
              method="post"
            >
              <div className="flex flex-col">
                <h3 className="py-2">Username</h3>
                <Input placeholder="example@domain.com" name="email" />
              </div>
              <div className="flex flex-col w-full">
                <h3 className="py-2">Password</h3>
                <Input type="password" name="password" />
              </div>
              <div className="flex items-center justify-between w-full gap-x-2">
                <ModeToggle />
                {fetcher.state === "submitting" ? (
                  <LoadingSpinner />
                ) : (
                  <Button type="submit">Login</Button>
                )}
              </div>
            </fetcher.Form>
          </div>
        </div>
        <img
          src={"/img/login.webp"}
          alt=""
          className="w-96 hidden lg:block rounded-r-2xl"
        />
      </div>
    </div>
  );
}

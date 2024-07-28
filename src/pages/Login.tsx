import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/components/Auth";
import { Button } from "@/components/ui/button";
import Loading from "@/components/Loading";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { setLocalPreferences } from "@/lib/utils";
import { AppPreferences } from "@/types";
import PageTitle from "@/components/PageTitle";

type LoginResponse = {
  message: string;
  token: string;
  preferences: AppPreferences;
};

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const mutation = useMutation<
    LoginResponse,
    Error,
    { email: string; password: string }
  >({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });
      return await response.json();
    },
    onSuccess: (data) => {
      signIn(data.token);
      setLocalPreferences(data.preferences);
      navigate("/", { replace: true });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Invalid email or password",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const fields = Object.fromEntries(
      new FormData(e.target as HTMLFormElement),
    );
    if (!fields.email || !fields.password) {
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Please fill in all fields",
      });
      return;
    }
    mutation.mutate({
      email: fields.email as string,
      password: fields.password as string,
    });
  };

  if (mutation.isPending) {
    return <Loading />;
  }

  return (
    <>
      <PageTitle title="Login | Homethings" />
      <div className="flex flex-col items-center justify-center h-screen max-h-screen">
        <div className="flex flex-col m-6 space-y-10 shadow-2xl rounded-2xl md:flex-row md:space-y-0 md:m-0 dark:bg-zinc-900">
          <div className="p-6 md:p-20">
            <div className="text-center py-5">
              <h1 className="text-5xl py-2">
                Welcome to <span className="text-accent">Homethings</span>
              </h1>
              <h6 className="text-xl py-2">Login to view awesome things</h6>
            </div>
            <form
              id="login-form"
              onSubmit={handleLogin}
              className="py-5 space-y-5"
            >
              <input
                type="email"
                name="email"
                className="w-full px-6 py-3 rounded-md focus:outline-none bg-transparent border"
                placeholder="Email"
              />
              <input
                type="password"
                name="password"
                className="w-full px-6 py-3 rounded-md focus:outline-none bg-transparent border"
                placeholder="Password"
              />
              <div className="flex flex-col items-center justify-between mt-6 space-y-6 md:flex-row md:space-y-0">
                <Button form="login-form" type="submit">
                  Login
                </Button>
                <ThemeToggle />
              </div>
            </form>
          </div>
          <Toaster />
          <img
            src="/static/login.webp"
            alt=""
            className="w-96 hidden lg:block rounded-r-2xl"
          />
        </div>
      </div>
    </>
  );
}

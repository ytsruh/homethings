import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../components/Auth";
import { Button } from "../components/ui/button";

interface LoginResponse {
  message: string;
  token: string;
}

export default function Login() {
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation<LoginResponse, Error, { email: string; password: string }>({
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
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      signIn(data.token);
      navigate("/", { replace: true });
      // Invalidate and refetch
    },
  });

  const handleLogin = () => {
    if (!email || !password) {
      setError("Please enter a valid email and password");
      return;
    }
    mutation.mutate({ email: email, password: password });
  };

  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError || error !== null) {
    return <div>Error...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen max-h-screen">
      <div className="flex flex-col m-6 space-y-10 shadow-2xl rounded-2xl md:flex-row md:space-y-0 md:m-0 dark:bg-zinc-900">
        <div className="p-6 md:p-20">
          <div className="text-center py-5">
            <h1 className="text-5xl py-2">
              Welcome to <span className="text-accent">Homethings</span>
            </h1>
            <h6 className="text-xl py-2">Login to view awesome things</h6>
          </div>
          <form id="login-form" onSubmit={handleLogin} className="py-5 space-y-5">
            <input
              type="email"
              className="w-full px-6 py-3 rounded-md focus:outline-none bg-transparent border"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              className="w-full px-6 py-3 rounded-md focus:outline-none bg-transparent border"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex flex-col items-center justify-between mt-6 space-y-6 md:flex-row md:space-y-0">
              <Button form="login-form" type="submit">
                Login
              </Button>
              {/* <ToggleTheme /> */}
            </div>
          </form>
        </div>

        <img src="/static/login.webp" alt="" className="w-96 hidden lg:block rounded-r-2xl" />
      </div>
    </div>
  );
}

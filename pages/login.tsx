import { SyntheticEvent, useState } from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import Button from "@/lib/ui/Button";
import Alert from "@/lib/ui/Alert";
import Loading from "@/lib/ui/Loading";

export default function Login() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const submitForm = async (e: SyntheticEvent) => {
    try {
      e.preventDefault();
      const target = e.target as typeof e.target & {
        email: { value: string };
        password: { value: string };
      };
      setSubmitting(true);
      const email = target.email.value;
      const password = target.password.value;
      // Pass credentials to NextAuth & login
      const result = await signIn("credentials", {
        email: email,
        password: password,
        redirect: false,
      });
      if (result?.ok) {
        router.push("/");
      } else {
        setError("There has been an error. Please try to enter you email & password again.");
        setSubmitting(false);
      }
    } catch (error) {
      console.log(error);
      setError("There has been an error. Something went wrong so please try again.");
      setSubmitting(false);
    }
  };

  if (submitting) {
    return <Loading />;
  }

  return (
    <div className="flex items-center justify-center h-screen bg-salt dark:bg-coal text-coal dark:text-salt">
      <div className="relative flex flex-col m-6 space-y-10 shadow-2xl rounded-2xl md:flex-row md:space-y-0 md:m-0">
        <div className="p-6 md:p-20">
          <div className="text-center py-5">
            <h1 className="text-primary text-5xl py-2">Welcome to Homethings</h1>
            <h6 className="text-xl py-2">Login to view awesome things</h6>
          </div>
          <form id="login-form" onSubmit={submitForm} className="py-5 space-y-5 text-coal dark:text-salt">
            <input
              type="email"
              className="w-full px-6 py-3 rounded-md focus:outline-none bg-transparent border-coal dark:border-salt border"
              placeholder="Email"
            />
            <input
              type="password"
              className="w-full px-6 py-3 rounded-md focus:outline-none bg-transparent border-coal dark:border-salt border"
              placeholder="Password"
            />
            <div className="flex flex-col items-center justify-between mt-6 space-y-6 md:flex-row md:space-y-0">
              <Button form="login-form" type="submit">
                Login
              </Button>
            </div>
          </form>
          {error ? <Alert text={error} close={setError} /> : ""}
        </div>

        <img src="img/login.jpg" alt="" className="w-96 hidden lg:block rounded-r-2xl" />
      </div>
    </div>
  );
}

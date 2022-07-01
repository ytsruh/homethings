import React, { useState } from "react";
import { useRouter } from "next/router";
import Button from "@/lib/ui/Button";
import Alert from "@/lib/ui/Alert";
import Loading from "@/components/Loading";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitForm = async (e) => {
    e.preventDefault();
    const url = `/api/login`;
    try {
      setSubmitting(true);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });
      //Check for ok response
      if (!response.ok) {
        //Throw error if not ok
        throw Error(response.statusText);
      }
      // Set to json, put token in storage & redirect
      const data = await response.json();
      await sessionStorage.setItem("user", JSON.stringify(data));
      router.push("/movies");
    } catch (err) {
      setSubmitting(false);
      setError("There has been an error. Please try to enter you email & password again.");
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
            <h1 className="text-primary text-5xl py-2">Welcome to Homeflix</h1>
            <h6 className="text-xl py-2">Login to view awesome Movies & TV shows</h6>
          </div>
          <form id="login-form" onSubmit={submitForm} className="py-5 space-y-5 text-coal dark:text-salt">
            <input
              type="email"
              className="w-full px-6 py-3 rounded-md focus:outline-none bg-transparent border-white border"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              className="w-full px-6 py-3 rounded-md focus:outline-none bg-transparent border-white border"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
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

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import Loading from "@/lib/ui/Loading";
import Protected from "@/components/Protected";
import PageTitle from "@/lib/ui/PageTitle";
import Alert from "@/lib/ui/Alert";
import Button from "@/lib/ui/Button";

type Error = string | Boolean | string;

export default function Profile() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [alert, setAlert] = useState("");
  const [error, setError] = useState<Error>(false);
  const [submitting, setSubmitting] = useState(false);
  const desc = "Create a new user";

  async function submitForm() {
    //Check passwords match and that password is at least 6 to meet MongoDB model requirements
    if (password !== passwordConfirm) {
      setAlert("Error: Your passwords do not match");
      return;
    }
    if (password.length < 6) {
      setAlert("Error: Your password is not long enough");
      return;
    }
    const url = `/api/users`;
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    try {
      setSubmitting(true);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: user.token,
        },
        body: JSON.stringify({
          name: name,
          email: email,
          password: password,
        }),
      });
      //Check for ok response
      if (!response.ok) {
        //Throw error if not ok
        throw Error(response.statusText);
      }
      setSubmitting(false);
      router.push("/users");
    } catch (err) {
      setSubmitting(false);
      setError(true);
    }
  }

  if (error) {
    router.push("/500");
  }

  if (submitting) {
    return <Loading />;
  }

  return (
    <Protected>
      <div className="py-3">
        <PageTitle title="Users" description={desc} image="/img/users.jpg" alt="Users in a theatre" />
        <div className="flex justify-center py-5 px-5 md:px-10 lg:px-16">
          <div>
            {alert ? (
              <div className="py-3">
                <Alert text={alert} close={setAlert} />
              </div>
            ) : (
              ""
            )}
            <form id="create-user" onSubmit={submitForm} className="py-8 space-y-5 text-coal dark:text-salt">
              <input
                type="text"
                className="w-full px-6 py-3 rounded-md focus:outline-none bg-transparent border-coal dark:border-salt border"
                placeholder="Name"
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="email"
                className="w-full px-6 py-3 rounded-md focus:outline-none bg-transparent border-coal dark:border-salt border"
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                className="w-full px-6 py-3 rounded-md focus:outline-none bg-transparent border-coal dark:border-salt border"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
              />
              <input
                type="password"
                className="w-full px-6 py-3 rounded-md focus:outline-none bg-transparent border-coal dark:border-salt border"
                placeholder="Confirm Password"
                onChange={(e) => setPasswordConfirm(e.target.value)}
              />
            </form>
            <div className="flex items-center justify-between">
              <div
                onClick={() => {
                  submitForm();
                }}
              >
                <Button form="create-user" type="submit">
                  Create
                </Button>
              </div>
              <a href="/users">
                <Button color="bg-coal dark:bg-salt" text="text-salt dark:text-coal" disabled>
                  Cancel
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </Protected>
  );
}

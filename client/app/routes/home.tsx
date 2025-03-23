import { useEffect } from "react";
import type { Route } from "./+types/home";
import PocketBase from "pocketbase";
import { useLocation } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [{ title: "New React Router App" }, { name: "description", content: "Welcome to React Router!" }];
}

export default function Home() {
  const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);
  let location = useLocation();

  useEffect(() => {
    const auth = pb.authStore;
    const loggedIn = auth.isValid;
    console.log("Logged in: " + loggedIn);
  }, [location]);

  return <div>Hello Homethings</div>;
}

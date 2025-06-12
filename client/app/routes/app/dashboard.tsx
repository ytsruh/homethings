import type { Route } from "./+types/dashboard";
import { redirect } from "react-router";
import { pb } from "~/lib/utils";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to Homethings" },
  ];
}

export async function clientLoader({}: Route.ClientLoaderArgs) {
  try {
    const user = pb.authStore.record;
    if (!user) {
      pb.authStore.clear();
      return redirect("/login");
    }
    return;
  } catch (error) {
    console.error(error);
    return;
  }
}

export default function Home() {
  return <div>Hello Homethings</div>;
}

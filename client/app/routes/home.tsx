import type { Route } from "./+types/home";
import { redirect } from "react-router";
import PocketBase from "pocketbase";
const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);

export function meta({}: Route.MetaArgs) {
  return [{ title: "New React Router App" }, { name: "description", content: "Welcome to Homethings" }];
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

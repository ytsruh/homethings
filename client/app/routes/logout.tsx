import { redirect } from "react-router";
import PocketBase from "pocketbase";
const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);

export async function clientLoader() {
  pb.authStore.clear();
  return redirect("/login");
}

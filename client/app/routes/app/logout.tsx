import { redirect } from "react-router";
import { pb } from "~/lib/utils";

export async function clientLoader() {
  pb.authStore.clear();
  return redirect("/login");
}

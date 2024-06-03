export const runtime = "edge";
import PageFrame from "@/components/PageFrame";
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const { user } = await validateRequest();
  if (!user) {
    return redirect("/login");
  }

  return (
    <PageFrame title="Dashboard" subtitle="Welcome to your account">
      <h1>Home</h1>
    </PageFrame>
  );
}

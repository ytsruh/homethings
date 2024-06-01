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
    <PageFrame
      title="Profile & Settings"
      subtitle="Change your profile picture or show/hide features to personalise your experience.">
      <h1>Profile</h1>
    </PageFrame>
  );
}

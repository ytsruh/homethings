export const runtime = "edge";
import PageFrame from "@/components/PageFrame";
import { lucia, validateRequest } from "@/lib/auth";
import { Form } from "@/lib/form";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import type { ActionResult } from "@/lib/form";

export default async function Page() {
  const { user } = await validateRequest();
  if (!user) {
    return redirect("/login");
  }

  return (
    <PageFrame title="Dashboard">
      <h1>Home</h1>
      <Form action={logout}>
        <button>Sign out</button>
      </Form>
    </PageFrame>
  );
}

async function logout(): Promise<ActionResult> {
  "use server";
  const { session } = await validateRequest();
  if (!session) {
    return {
      error: "Unauthorized",
    };
  }

  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  return redirect("/login");
}

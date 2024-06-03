export const runtime = "edge";
import PageFrame from "@/components/PageFrame";
import { validateRequest } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db/index";
import { userTable } from "@/db/schema";
import { ProfileForm } from "./form";
import { profileFormSchema } from "@/lib/schema";
import type { SelectUser } from "@/db/schema";

export default async function Page() {
  const { user } = await validateRequest();
  if (!user) {
    return redirect("/login");
  }

  const profile = await db.select().from(userTable).where(eq(userTable.id, user.id));
  if (!profile.length) {
    return redirect("/");
  }

  return (
    <PageFrame
      title="Profile & Settings"
      subtitle="Change your profile picture or show/hide features to personalise your experience.">
      <ProfileForm action={submit} profile={profile[0]} />
    </PageFrame>
  );
}

async function submit(prevState: any, formData: SelectUser) {
  "use server";
  const { user } = await validateRequest();
  const validation = profileFormSchema.safeParse({
    name: formData.name,
    email: formData.email,
    showDocuments: formData.showDocuments,
    showBooks: formData.showBooks,
  });

  if (validation.success) {
    try {
      const existingUser = await db
        .update(userTable)
        .set({ name: validation.data.name })
        .where(eq(userTable.id, user!.id));
      if (!existingUser) {
        return {
          error: "Incorrect username or password",
        };
      }
      redirect("/");
    } catch (error) {
      console.log(error);
      return {
        error: "An unknown error occurred",
      };
    }
  } else {
    return {
      errors: validation.error.issues,
    };
  }
}

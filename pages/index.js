import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Loading from "@/components/Loading";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <Loading />;
  }
  if (status === "unauthenticated") {
    router.push("/login");
  }
  if (status === "authenticated") {
    router.push("/movies");
  }
}

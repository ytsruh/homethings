import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Navigation from "@/components/Navigation";
import Loading from "@/components/Loading";

type Props = {
  children: JSX.Element;
};

export default function Protected(props: Props) {
  const router = useRouter();
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <Loading />;
  }
  if (status === "authenticated") {
    return (
      <>
        <Navigation icon={session.user?.icon} />
        <div className="min-h-screen bg-salt dark:bg-coal text-coal dark:text-salt">{props.children}</div>
      </>
    );
  }
  if (status === "unauthenticated") {
    router.push("/login");
  }

  return <Loading />;
}

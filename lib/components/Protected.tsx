import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Navigation from "@/components/Navigation";
import Loading from "@/components/Loading";
import useFetchData from "@/lib/hooks/useFetchData";
import { FavouriteContext } from "@/lib/hooks/FavouriteContext";

type Props = {
  children: JSX.Element;
};

export default function Protected(props: Props) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { apiData } = useFetchData("/api/favourite" as unknown as URL);

  if (status === "loading") {
    return <Loading />;
  }
  if (status === "authenticated") {
    return (
      <FavouriteContext.Provider value={apiData as any}>
        <Navigation icon={session.user?.icon} />
        <div className="min-h-screen bg-salt dark:bg-coal text-coal dark:text-salt">{props.children}</div>
      </FavouriteContext.Provider>
    );
  }
  if (status === "unauthenticated") {
    router.push("/login");
  }

  return <Loading />;
}

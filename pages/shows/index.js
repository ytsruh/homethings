import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Loading from "@/components/Loading";
import Protected from "@/components/Protected";
import PageTitle from "@/components/PageTitle";
import ShowsList from "@/components/ShowsList";

export default function Shows() {
  const router = useRouter();
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const getData = async () => {
      try {
        const user = JSON.parse(sessionStorage.getItem("user"));
        const response = await fetch(`/api/shows`, {
          headers: { token: user.token },
        });
        if (!response.ok) {
          setError(true);
        }
        const data = await response.json();
        setShows(data);
        setLoading(false);
      } catch (err) {
        setError(true);
        setLoading(false);
      }
    };
    getData();
  }, []);

  if (error) {
    router.push("/500");
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <Protected>
      <div className="mb-3">
        <PageTitle title="TV Shows" description={desc} image="img/showshero1.jpeg" alt="Shows Hero" />
        <ShowsList data={shows} />
      </div>
    </Protected>
  );
}

const desc = "Action, comedy & fantasy TV shows from 24 to Game of Thrones. Sit back & binge.";

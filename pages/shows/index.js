import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Loading from "@/components/Loading";
import Protected from "@/components/Protected";
import PageTitle from "@/components/PageTitle";
import ShowsList from "@/components/ShowsList";
import useFetchData from "@/lib/hooks/useFetchData";

export default function Shows() {
  const router = useRouter();
  const { isLoading, serverError, apiData } = useFetchData(`/api/shows`);

  if (isLoading) {
    return <Loading />;
  }
  if (serverError) {
    router.push("/500");
  }

  if (apiData) {
    return (
      <Protected>
        <div className="py-3">
          <PageTitle title="TV Shows" description={desc} image="img/showshero1.jpeg" alt="Shows Hero" />
          <ShowsList data={apiData} />
        </div>
      </Protected>
    );
  }
}

const desc = "Action, comedy & fantasy TV shows from 24 to Game of Thrones. Sit back & binge.";

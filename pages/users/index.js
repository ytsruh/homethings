import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import Loading from "@/components/Loading";
import Protected from "@/components/Protected";
import PageTitle from "@/components/PageTitle";
import Button from "@/lib/ui/Button";
import useFetchData from "@/lib/hooks/useFetchData";

export default function Profile() {
  const router = useRouter();
  const desc = "Admin section to add, update or remove users";

  const { isLoading, serverError, apiData } = useFetchData(`/api/users`);

  if (isLoading) {
    return <Loading />;
  }
  if (serverError) {
    router.push("/500");
  }

  const rows = apiData.map((user, i) => {
    return <EpisodeRow data={user} key={i} />;
  });

  return (
    <Protected>
      <div className="py-3">
        <PageTitle title="Users" description={desc} image="img/users.jpg" alt="Users in a theatre" />
        <div className="container mx-auto flex justify-center md:justify-end py-5 px-5 md:px-10 lg:px-16">
          <a href="/users/create">
            <Button>Add New User</Button>
          </a>
        </div>
        <div className="flex justify-center py-5 px-5 md:px-10 lg:px-16">
          <div>
            <table className="min-w-full text-center my-5">
              <thead>
                <tr className="font-bold border-b-4 border-salt">
                  <th>Name</th>
                  <th>Email</th>
                  <th className="hidden md:table-cell">Icon</th>
                  <th className="hidden lg:table-cell">Dark Mode</th>
                  <th className="hidden lg:table-cell">Created</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody className="">{rows}</tbody>
            </table>
          </div>
        </div>
        <div className="py-10">
          <h5 className="text-center">App version: {process.env.NEXT_PUBLIC_VERSION}</h5>
        </div>
      </div>
    </Protected>
  );
}

const EpisodeRow = (props) => {
  return (
    <tr className="">
      <td>{props.data.name}</td>
      <td>{props.data.email}</td>
      <td className="hidden md:table-cell">{props.data.icon}</td>
      <td className="hidden lg:table-cell capitalize">{props.data.darkMode}</td>
      <td className="hidden lg:table-cell">{dayjs(props.data.createdAt).format("DD/MM/YYYY")}</td>
      <td>{dayjs(props.data.updatedAt).format("DD/MM/YYYY")}</td>
    </tr>
  );
};

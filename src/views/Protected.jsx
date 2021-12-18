import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import Navigation from "../components/Navigation";

//https://reacttraining.com/blog/react-router-v6-pre/#nested-routes-and-layouts
//https://stackoverflow.com/questions/62384395/protected-route-with-react-router-v6

export default function Protected() {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const now = Math.floor(Date.now() / 1000);

  //Test for user & that token is valid
  if (!user || now > user.expiry) {
    return <Navigate replace to="/logout" />;
  }

  return (
    <>
      <Navigation />
      <Outlet />
    </>
  );
}

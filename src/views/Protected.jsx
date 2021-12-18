import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Navigation from "../components/Navigation";

//https://reacttraining.com/blog/react-router-v6-pre/#nested-routes-and-layouts
//https://stackoverflow.com/questions/62384395/protected-route-with-react-router-v6

export default function Protected() {
  //const [user, setUser] = useState(true);
  return (
    <>
      <Navigation />
      <Outlet />
    </>
  );
}

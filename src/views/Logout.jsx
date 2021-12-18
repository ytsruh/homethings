import React from "react";
import { Navigate } from "react-router-dom";

export default function Logout() {
  sessionStorage.clear();
  return <Navigate replace to="/login" />;
}

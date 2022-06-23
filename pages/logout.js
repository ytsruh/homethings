import React, { useEffect } from "react";
import { useRouter } from "next/router";
import Loading from "@/components/Loading";

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    sessionStorage.clear();
    router.push("/login");
  }, []);

  return null;
}

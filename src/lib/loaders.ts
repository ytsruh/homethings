import { getToken } from "@/lib/utils";
import { queryClient } from "@/lib/utils";

export async function profileLoader() {
  return queryClient.fetchQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await fetch("/api/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: getToken(),
        },
      });
      if (response.status === 401) {
        throw new Response("Unauthorised", { status: 401 });
      }
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      return response.json();
    },
  });
}

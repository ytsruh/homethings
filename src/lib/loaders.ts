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

export async function notesLoader() {
  return queryClient.fetchQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      const response = await fetch("/api/notes", {
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

export async function notesSingleLoader(id: string) {
  return queryClient.fetchQuery({
    queryKey: [`note-${id}`],
    queryFn: async () => {
      const response = await fetch(`/api/notes/${id}`, {
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

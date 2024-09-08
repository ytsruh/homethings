import { getToken } from "@/lib/utils";
import { queryClient } from "@/lib/utils";
import { LoaderFunctionArgs } from "react-router-dom";
import { redirect } from "react-router-dom";

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
        sessionStorage.clear();
        return redirect("/login");
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
        sessionStorage.clear();
        return redirect("/login");
      }
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      return response.json();
    },
  });
}

export async function notesSingleLoader(req: LoaderFunctionArgs) {
  return queryClient.fetchQuery({
    queryKey: [`note-${req.params.id}`],
    queryFn: async () => {
      const response = await fetch(`/api/notes/${req.params.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: getToken(),
        },
      });
      if (response.status === 401) {
        sessionStorage.clear();
        return redirect("/login");
      }
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      return response.json();
    },
  });
}

export async function documentsLoader() {
  return queryClient.fetchQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const response = await fetch("/api/documents", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: getToken(),
        },
      });
      if (response.status === 401) {
        sessionStorage.clear();
        return redirect("/login");
      }
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      return response.json();
    },
  });
}

export async function documentsSingleLoader(req: LoaderFunctionArgs) {
  return queryClient.fetchQuery({
    queryKey: [`document-${req.params.id}`],
    queryFn: async () => {
      const response = await fetch(`/api/documents/${req.params.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: getToken(),
        },
      });
      if (response.status === 401) {
        sessionStorage.clear();
        return redirect("/login");
      }
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      return response.json();
    },
  });
}

export async function booksLoader() {
  return queryClient.fetchQuery({
    queryKey: ["books"],
    queryFn: async () => {
      const response = await fetch("/api/books", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: getToken(),
        },
      });
      if (response.status === 401) {
        sessionStorage.clear();
        return redirect("/login");
      }
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      return response.json();
    },
  });
}

export async function booksReadLoader() {
  return queryClient.fetchQuery({
    queryKey: ["books"],
    queryFn: async () => {
      const response = await fetch("/api/books/read", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: getToken(),
        },
      });
      if (response.status === 401) {
        sessionStorage.clear();
        return redirect("/login");
      }
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      return response.json();
    },
  });
}

export async function booksUnreadLoader() {
  return queryClient.fetchQuery({
    queryKey: ["books"],
    queryFn: async () => {
      const response = await fetch("/api/books/unread", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: getToken(),
        },
      });
      if (response.status === 401) {
        sessionStorage.clear();
        return redirect("/login");
      }
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      return response.json();
    },
  });
}

export async function booksWishlistLoader() {
  return queryClient.fetchQuery({
    queryKey: ["books"],
    queryFn: async () => {
      const response = await fetch("/api/books/wishlist", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: getToken(),
        },
      });
      if (response.status === 401) {
        sessionStorage.clear();
        return redirect("/login");
      }
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      return response.json();
    },
  });
}

export async function booksSingleLoader(req: LoaderFunctionArgs) {
  return queryClient.fetchQuery({
    queryKey: [`books-${req.params.id}`],
    queryFn: async () => {
      const response = await fetch(`/api/books/${req.params.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: getToken(),
        },
      });
      if (response.status === 401) {
        sessionStorage.clear();
        return redirect("/login");
      }
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      return response.json();
    },
  });
}

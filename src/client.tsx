import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, RouteObject } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/utils";
import "@/lib/styles.css";
import { ProtectedRoute, AuthProvider } from "@/components/Auth";
import { ThemeProvider } from "@/components/Theme";
import {
  profileLoader,
  notesLoader,
  notesSingleLoader,
  documentsLoader,
  documentsSingleLoader,
  booksLoader,
  booksReadLoader,
  booksWishlistLoader,
  booksUnreadLoader,
  booksSingleLoader,
} from "@/lib/loaders";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Profile from "@/pages/Profile";
import Notes from "@/pages/Notes";
import SingleNote from "@/pages/NotesSingle";
import Documents from "@/pages/Documents";
import SingleDocument from "@/pages/DocumentsSingle";
import BooksHome from "@/pages/books/Home";
import BooksSearch from "@/pages/books/Search";
import BooksCreate from "@/pages/books/Create";
import BooksList from "@/pages/books/List";
import SingleBook from "./pages/books/SingleBook";
import Feedback from "@/pages/Feedback";
import Chat from "@/pages/Chat";
import { Error, ErrorTemplate } from "@/pages/Error";

const routes: RouteObject[] = [
  {
    path: "/login",
    element: <Login />,
    errorElement: <Error />,
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/notes",
        loader: notesLoader,
        element: <Notes />,
      },
      {
        path: "/notes/:id",
        loader: notesSingleLoader,
        element: <SingleNote />,
      },
      {
        path: "/documents",
        loader: documentsLoader,
        element: <Documents />,
      },
      {
        path: "/documents/:id",
        loader: documentsSingleLoader,
        element: <SingleDocument />,
      },
      {
        path: "/books",
        loader: booksLoader,
        element: <BooksHome />,
      },
      {
        path: "/books/search",
        element: <BooksSearch />,
      },
      {
        path: "/books/create",
        element: <BooksCreate />,
      },
      {
        path: "/books/read",
        loader: booksReadLoader,
        element: <BooksList title="Read" />,
      },
      {
        path: "/books/unread",
        loader: booksUnreadLoader,
        element: <BooksList title="Unread" />,
      },
      {
        path: "/books/wishlist",
        loader: booksWishlistLoader,
        element: <BooksList title="Wishlist" />,
      },
      {
        path: "/books/:id",
        loader: booksSingleLoader,
        element: <SingleBook />,
      },
      {
        path: "/profile",
        loader: profileLoader,
        element: <Profile />,
      },
      {
        path: "/chat",
        element: <Chat />,
      },
      {
        path: "/feedback",
        element: <Feedback />,
      },
    ],
  },
  { path: "*", element: <ErrorTemplate status={404} /> },
];

function App() {
  const router = createBrowserRouter(routes);
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <div className="text-zinc-950 dark:text-zinc-50 bg-zinc-50 dark:bg-zinc-950">
            <RouterProvider router={router} />
          </div>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

const domNode = document.getElementById("root")!;
const root = ReactDOM.createRoot(domNode);
root.render(<App />);

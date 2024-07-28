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
import SingleBook from "./pages/books/SingleBook";

const Error = React.lazy(() => import("@/pages/Error"));
const NotFound = React.lazy(() => import("@/pages/NotFound"));
const Home = React.lazy(() => import("@/pages/Home"));
const Login = React.lazy(() => import("@/pages/Login"));
const Profile = React.lazy(() => import("@/pages/Profile"));
const Notes = React.lazy(() => import("@/pages/Notes"));
const SingleNote = React.lazy(() => import("@/pages/NotesSingle"));
const Documents = React.lazy(() => import("@/pages/Documents"));
const SingleDocument = React.lazy(() => import("@/pages/DocumentsSingle"));
const BooksHome = React.lazy(() => import("@/pages/books/Home"));
const BooksSearch = React.lazy(() => import("@/pages/books/search"));
const BooksCreate = React.lazy(() => import("@/pages/books/Create"));
const BooksList = React.lazy(() => import("@/pages/books/List"));
const Feedback = React.lazy(() => import("@/pages/Feedback"));
const Chat = React.lazy(() => import("@/pages/Chat"));

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
  { path: "*", element: <NotFound /> },
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

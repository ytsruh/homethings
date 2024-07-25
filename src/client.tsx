import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, RouteObject } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/utils";
import "@/lib/styles.css";
import { ProtectedRoute, AuthProvider } from "@/components/Auth";
import { ThemeProvider } from "@/components/Theme";
import { profileLoader, notesLoader, notesSingleLoader } from "@/lib/loaders";

const Error = React.lazy(() => import("@/pages/Error"));
const NotFound = React.lazy(() => import("@/pages/NotFound"));
const Home = React.lazy(() => import("@/pages/Home"));
const Login = React.lazy(() => import("@/pages/Login"));
const Profile = React.lazy(() => import("@/pages/Profile"));
const Notes = React.lazy(() => import("@/pages/Notes"));
const SingleNote = React.lazy(() => import("@/pages/NotesSingle"));
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
        loader: ({ params }) => {
          return notesSingleLoader(params.id as string);
        },
        element: <SingleNote />,
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

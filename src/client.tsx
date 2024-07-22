import * as React from "react";
import * as ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  RouteObject,
} from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/utils";
import "@/lib/styles.css";
import { ProtectedRoute, AuthProvider } from "@/components/Auth";
import { ThemeProvider } from "@/components/Theme";
import { profileLoader } from "@/lib/loaders";

const Home = React.lazy(() => import("@/pages/Home"));
const Login = React.lazy(() => import("@/pages/Login"));
const Profile = React.lazy(() => import("@/pages/Profile"));
const Error = React.lazy(() => import("@/pages/Error"));
const NotFound = React.lazy(() => import("@/pages/NotFound"));

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
        path: "/profile",
        loader: profileLoader,
        element: <Profile />,
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
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

const domNode = document.getElementById("root")!;
const root = ReactDOM.createRoot(domNode);
root.render(<App />);

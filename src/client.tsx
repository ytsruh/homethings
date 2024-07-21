import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, RouteObject } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./lib/styles.css";
import { ProtectedRoute, AuthProvider } from "./components/Auth";

const Home = React.lazy(() => import("./pages/Home"));
const Login = React.lazy(() => import("./pages/Login"));
const Logout = React.lazy(() => import("./pages/Logout"));

const routes: RouteObject[] = [
  {
    path: "/login",
    element: <Login />,
    errorElement: <div>error</div>,
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    errorElement: <div>error</div>,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/profile",
        element: <div>User Profile</div>,
      },
      {
        path: "/logout",
        element: <Logout />,
      },
    ],
  },
  { path: "*", element: <div>Not Found</div> },
];

function App() {
  const router = createBrowserRouter(routes);
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
}

const domNode = document.getElementById("root")!;
const root = ReactDOM.createRoot(domNode);
root.render(<App />);

import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./lib/styles.css";
import { ProtectedRoute, AuthProvider } from "./components/Auth";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Logout from "./pages/Logout";

const routes = [
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
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
];

function App() {
  const router = createBrowserRouter(routes);
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

const domNode = document.getElementById("root")!;
const root = ReactDOM.createRoot(domNode);
root.render(<App />);

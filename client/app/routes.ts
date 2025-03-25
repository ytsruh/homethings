import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  route("login", "routes/login.tsx"),
  layout("routes/layout.tsx", [index("routes/home.tsx"), route("logout", "routes/logout.tsx")]),
] satisfies RouteConfig;

import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  route("login", "routes/login.tsx"),
  layout("routes/layout.tsx", [
    index("routes/home.tsx"),
    route("logout", "routes/logout.tsx"),
    route("chat", "routes/chat.tsx"),
    route("tasks", "routes/tasks.tsx"),
    route("notes", "routes/notes.tsx"),
    route("books", "routes/books.tsx"),
    route("profile", "routes/profile.tsx"),
    route("feedback", "routes/feedback.tsx"),
  ]),
] satisfies RouteConfig;

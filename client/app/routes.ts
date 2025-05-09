import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  route("login", "routes/login.tsx"),
  layout("routes/layout.tsx", [
    index("routes/home.tsx"),
    route("logout", "routes/logout.tsx"),
    route("chat", "routes/chat.tsx"),
    route("tasks", "routes/tasks/all.tsx"),
    route("tasks/:id", "routes/tasks/single.tsx"),
    route("tasks/:id/delete", "routes/tasks/delete.tsx"),
    route("tasks/:id/complete", "routes/tasks/complete.tsx"),
    route("tasks/:id/comments", "routes/tasks/comments.tsx"),
    route("tasks/:taskid/comments/:commentid/delete", "routes/tasks/comments-delete.tsx"),
    route("notes", "routes/notes.tsx"),
    route("notes/:id", "routes/notes-single.tsx"),
    route("notes/:id/delete", "routes/notes-delete.tsx"),
    route("profile", "routes/profile.tsx"),
    route("feedback", "routes/feedback.tsx"),
  ]),
] satisfies RouteConfig;

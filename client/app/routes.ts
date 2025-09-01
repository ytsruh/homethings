import {
  type RouteConfig,
  index,
  route,
  layout,
  prefix,
} from "@react-router/dev/routes";

export default [
  layout("routes/layout.tsx", [
    index("routes/home.tsx"),
    route("projects", "routes/projects.tsx"),
    route("work-history", "routes/work-history.tsx"),
    route("blog", "routes/blog.tsx"),
    route("blog/:slug", "routes/blog-single.tsx"),
    route("now", "routes/now.tsx"),
    route("contact", "routes/contact.tsx"),
  ]),

  route("login", "routes/login.tsx"),

  ...prefix("app", [
    layout("routes/app/layout.tsx", [
      index("routes/app/dashboard.tsx"),
      route("logout", "routes/app/logout.tsx"),
      route("chat", "routes/app/chat.tsx"),
      route("tasks", "routes/app/tasks/all.tsx"),
      route("tasks/:id", "routes/app/tasks/single.tsx"),
      route("tasks/:id/delete", "routes/app/tasks/delete.tsx"),
      route("tasks/:id/complete", "routes/app/tasks/complete.tsx"),
      route("tasks/:id/comments", "routes/app/tasks/comments.tsx"),
      route(
        "tasks/:taskid/comments/:commentid/delete",
        "routes/app/tasks/comments-delete.tsx"
      ),
      route("notes", "routes/app/notes.tsx"),
      route("notes/:id", "routes/app/notes-single.tsx"),
      route("notes/:id/delete", "routes/app/notes-delete.tsx"),
      route("profile", "routes/app/profile.tsx"),
      route("feedback", "routes/app/feedback.tsx"),
    ]),
  ]),
] satisfies RouteConfig;

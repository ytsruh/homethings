import type { Route } from "./+types/tasks";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Tasks" }, { name: "description", content: "Welcome to Homethings" }];
}

export default function Tasks() {
  return <div>Hello Tasks</div>;
}

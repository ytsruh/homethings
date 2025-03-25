import type { Route } from "./+types/notes";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Notes" }, { name: "description", content: "Welcome to Homethings" }];
}

export default function Notes() {
  return <div>Hello Notes</div>;
}

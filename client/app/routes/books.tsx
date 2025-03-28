import type { Route } from "./+types/books";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Books" }, { name: "description", content: "Welcome to Homethings" }];
}

export default function Books() {
  return <div>Hello Books</div>;
}

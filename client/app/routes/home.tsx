import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [{ title: "New React Router App" }, { name: "description", content: "Welcome to Homethings" }];
}

export default function Home() {
  return <div>Hello Homethings</div>;
}

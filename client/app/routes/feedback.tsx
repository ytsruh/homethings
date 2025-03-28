import type { Route } from "./+types/feedback";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Feedback" }, { name: "description", content: "Welcome to Homethings" }];
}

export default function Feedback() {
  return <div>Hello Feedback</div>;
}

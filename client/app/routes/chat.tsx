import type { Route } from "./+types/chat";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Chat" }, { name: "description", content: "Welcome to Homethings" }];
}

export default function Chat() {
  return <div>Hello Chat</div>;
}

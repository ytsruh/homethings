import type { Route } from "./+types/profile";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Profile" }, { name: "description", content: "Welcome to Homethings" }];
}

export default function Profile() {
  return <div>Hello Profile</div>;
}

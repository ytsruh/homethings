import { trpc } from "@/lib/trpc";

export default function TRPCTest() {
  const hello = trpc.hello.useQuery({ text: "world" });
  if (!hello.data) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <p>{hello.data.greeting}</p>
    </div>
  );
}

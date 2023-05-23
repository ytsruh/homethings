import Protected from "@/components/Protected";
import PageTitle from "@/lib/ui/PageTitle";

export default function Home(props: any) {
  return (
    <Protected>
      <div className="flex flex-col">
        <PageTitle title="Welcome to Homethings" image={"img/home.jpg"} alt="Homepage Hero" />
      </div>
    </Protected>
  );
}

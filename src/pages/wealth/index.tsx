import PageTitle from "@/components/PageTitle";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Link, useLoaderData } from "react-router-dom";
import { WealthItemWithValues } from "@/types";

type WealthResponse = {
  message: string;
  data: WealthItemWithValues[];
};

export default function Wealth() {
  const data = useLoaderData() as WealthResponse;

  return (
    <>
      <PageTitle title="Wealth | Homethings" />
      <PageHeader title="Wealth Tracker" subtitle="Track your assets and liabilities" />
      <div className="w-full flex justify-end py-5">
        <Button asChild>
          <Link to="/wealth/new">Create</Link>
        </Button>
      </div>
      {data.data.length === 0 ? (
        <NoItems />
      ) : (
        <div className="text-center text-lg py-5">There are {data.data.length} items created</div>
      )}
    </>
  );
}

function NoItems() {
  return (
    <div className="w-full flex flex-col justify-center items-center gap-2">
      <div className="w-full">
        <p className="text-center text-xl font-bold">No items found</p>
      </div>
      <div className="w-full">
        <p className="text-center text-sm">Create a new item to get started</p>
      </div>
    </div>
  );
}

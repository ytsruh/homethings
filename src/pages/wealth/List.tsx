import { Link, useLoaderData } from "react-router-dom";
import { WealthItem } from "@/types";
import { Button } from "@/components/ui/button";
import { ChevronRightIcon } from "@radix-ui/react-icons";

type WealthResponse = {
  message: string;
  data: WealthItem[];
};

export default function List() {
  const data = useLoaderData() as WealthResponse;
  console.log(data);
  return (
    <div className="flex flex-col md:flex-row justify-between gap-5">
      <div className="w-full">
        <h2 className="pb-2 underline">Assets</h2>
        {data.data.length === 0 ? (
          <NoItems />
        ) : (
          data.data.map((entry, i) => {
            if (entry.type === "asset") {
              return (
                <div key={i} className="flex justify-between items-center">
                  <p>{entry.name}</p>
                  <Button asChild className="my-1" variant="outline" size="icon">
                    <Link to={`/wealth/${entry.id}`}>
                      <ChevronRightIcon />
                    </Link>
                  </Button>
                </div>
              );
            }
          })
        )}
      </div>
      <div className="w-full">
        <h2 className="pb-2 underline">Liabilities</h2>
        {data.data.length === 0 ? (
          <NoItems />
        ) : (
          data.data.map((entry, i) => {
            if (entry.type === "liability") {
              return (
                <div key={i} className="flex justify-between items-center">
                  <p>{entry.name}</p>
                  <Button asChild className="my-1" variant="outline" size="icon">
                    <Link to={`/wealth/${entry.id}`}>
                      <ChevronRightIcon />
                    </Link>
                  </Button>
                </div>
              );
            }
          })
        )}
      </div>
    </div>
  );
}

function NoItems() {
  return (
    <div className="w-full flex flex-col justify-center items-center gap-2">
      <p className="text-center italic">No items</p>
    </div>
  );
}

import { useLoaderData } from "react-router-dom";
import { WealthItem } from "@/types";

type SingleResponse = {
  message: string;
  data: WealthItem;
};

export default function SingleItem() {
  const loaded = useLoaderData() as SingleResponse;
  console.log(loaded);

  return <div>Single Item</div>;
}

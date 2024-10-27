import { useState } from "react";
import { WealthItemWithValues, WealthItem } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLoaderData } from "react-router-dom";

type WealthResponse = {
  message: string;
  data: WealthItemWithValues[];
};

export default function LatestWealth() {
  const data = useLoaderData() as WealthResponse;
  const [wealth, setWealth] = useState<WealthItemWithValues[]>(data.data);
  const [updates, setUpdates] = useState<{ item: WealthItem; value: string }[]>([]);

  function handleUpdate(e: React.ChangeEvent<HTMLInputElement>, item: WealthItem) {
    const value = e.target.value;
    setUpdates((prevUpdates) => {
      const existingIndex = prevUpdates.findIndex((update) => update.item.id === item.id);
      if (existingIndex !== -1) {
        // If an entry for this item already exists, update it
        const newUpdates = [...prevUpdates];
        newUpdates[existingIndex] = { item, value };
        return newUpdates;
      } else {
        // If no entry exists for this item, add a new one
        return [...prevUpdates, { item, value }];
      }
    });
  }

  function handleUpdateAll() {
    console.log(updates);
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between gap-5">
        <div className="w-full">
          <h2 className="pb-2">Assets</h2>
          <Table className="dark:text-white">
            <TableHeader>
              <TableRow>
                <TableHead className="">Name</TableHead>
                <TableHead className="">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wealth.map((entry, i) => {
                if (entry.item.type === "asset") {
                  return (
                    <TableRow key={i}>
                      <TableCell className="w-1/2">{entry.item.name}</TableCell>
                      <TableCell className="w-1/2">
                        <Input
                          placeholder="£0.00"
                          type="currency"
                          onChange={(e) => handleUpdate(e, entry.item)}></Input>
                      </TableCell>
                    </TableRow>
                  );
                }
              })}
            </TableBody>
          </Table>
        </div>
        <div className="w-full">
          <h2 className="pb-2">Liabilities</h2>
          <Table className="dark:text-white">
            <TableHeader>
              <TableRow>
                <TableHead className="">Name</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wealth.map((entry, i) => {
                if (entry.item.type === "liability") {
                  return (
                    <TableRow key={i}>
                      <TableCell className="w-1/2">{entry.item.name}</TableCell>
                      <TableCell className="w-1/2">
                        <Input
                          placeholder="£0.00"
                          type="currency"
                          onChange={(e) => handleUpdate(e, entry.item)}></Input>
                      </TableCell>
                    </TableRow>
                  );
                }
              })}
            </TableBody>
          </Table>
        </div>
      </div>
      <Separator className="my-2" />
      <div className="w-full flex justify-between">
        <h1 className="text-zinc-500 dark:text-zinc-400 italic py-2">Update latest values for this month</h1>
        <Button onClick={handleUpdateAll}>Update all</Button>
      </div>
    </div>
  );
}

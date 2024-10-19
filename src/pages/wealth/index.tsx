import PageTitle from "@/components/PageTitle";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Link, Outlet, useLoaderData } from "react-router-dom";
import { WealthItemWithValues } from "@/types";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

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
      {data.data.length === 0 ? (
        <div>
          <div className="w-full flex justify-end py-5">
            <Button asChild>
              <Link to="/wealth/new">New</Link>
            </Button>
          </div>
          <NoItems />
        </div>
      ) : (
        <div className="w-full">
          <div className="w-full flex justify-between py-5">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
                    <Link to="/wealth">Summary</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
                    <Link to="/wealth/list">List</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
                    <Link to="/wealth/latest">Latest</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            <Button asChild>
              <Link to="/wealth/new">New</Link>
            </Button>
          </div>
          <Outlet />
        </div>
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

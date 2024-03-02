import { ToggleTheme } from "./ToggleTheme";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PinRightIcon } from "@radix-ui/react-icons";
import { HomeIcon } from "@radix-ui/react-icons";

export default function NavBar() {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 md:px-6">
        <a className="text-accent flex justify-center items-center gap-2" href="/">
          <HomeIcon className="block h-[1.4rem] w-[1.4rem]" />
          <p className="block">Homethings</p>
        </a>
        <div className="ml-auto flex items-center space-x-2 md:space-x-4">
          <ToggleTheme />
          <Link href="/login">
            <Button variant="outline" size="icon">
              <PinRightIcon />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

import { signOut } from "next-auth/react";
import Icon from "./Icon";
import Dropdown from "@/lib/ui/Dropdown";
import ThemePicker from "@/components/ThemePicker";

type Props = {
  icon: string;
};

export default function Navigation(props: Props) {
  return (
    <div
      className="flex items-center justify-between px-5 md:px-10 lg:px-20 py-4 bg-salt dark:bg-coal text-primary 
      sticky top-0 z-50 border-b border-coal dark:border-none"
    >
      <a href="/" className="text-2xl">
        Homeflix
      </a>
      <div className="flex items-center space-x-2 md:space-x-10">
        <a href="/movies">Movies</a>
        <a href="/shows">Shows</a>
      </div>
      <div className="flex space-x-5">
        <ThemePicker />
        <Dropdown
          menuItem={<Icon icon={props.icon} color="primary" styles={iconStyles} />}
          menuItems={items}
        />
      </div>
    </div>
  );
}

const items = [
  { link: "/profile", text: "Profile" },
  { link: "/users", text: "Users" },
  { text: "Logout", onClick: () => signOut({ callbackUrl: "/login" }) },
];

const iconStyles = {
  fontSize: "20px",
};

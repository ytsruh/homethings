import React, { useState } from "react";

export default function Dropdown(props) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative cursor-pointer">
      <div onClick={() => setShow(!show)}>{props.menuItem}</div>
      {show ? <List links={props.menuItems} /> : ""}
    </div>
  );
}

Dropdown.defaultProps = {
  menuItem: "Menu",
};

const List = (props) => {
  const links = props.links?.map((link, i) => {
    return (
      <li className="py-1 px-5 md:px-10 hover:bg-neutral-500 rounded-md">
        <a href={link.link}>{link.text}</a>
      </li>
    );
  });
  return (
    <ul className="absolute m-2 py-2 bg-salt dark:bg-slate text-coal dark:text-salt rounded-lg right-0 text-center">
      {props.links ? links : ""}
    </ul>
  );
};

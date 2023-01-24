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
      <li key={i} className="my-1 py-1">
        {link.link ? (
          <a href={link.link} className="py-2 px-5 md:px-10 hover:bg-neutral-500 hover:text-salt rounded-md">
            {link.text}
          </a>
        ) : (
          <a
            onClick={() => link.onClick()}
            className="py-2 px-5 md:px-10 hover:bg-neutral-500 hover:text-salt rounded-md"
          >
            {link.text}
          </a>
        )}
      </li>
    );
  });
  return (
    <ul className="absolute m-2 py-2 bg-salt dark:bg-slate text-coal dark:text-salt rounded-lg right-0 text-center">
      {props.links ? links : ""}
    </ul>
  );
};

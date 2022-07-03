import React from "react";
import * as Icons from "react-icons/bs";

export default function Button(props) {
  return <button className={`${props.color} ${props.text} px-6 py-3 rounded-md`}>{props.children}</button>;
}

Button.defaultProps = {
  color: "bg-primary",
  text: "text-salt",
};

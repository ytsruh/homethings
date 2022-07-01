import React from "react";
import * as Icons from "react-icons/bs";

export default function Button(props) {
  return <button className="bg-primary text-white px-6 py-3 rounded-md ">{props.children}</button>;
}

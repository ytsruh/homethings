import React from "react";
import * as Icons from "react-icons/bs";

export default function Profile(props) {
  const icon = Icons[props.icon]();
  const color = props.color || "white";
  return (
    <div style={props.styles} className={`text-${color}`}>
      {icon}
    </div>
  );
}
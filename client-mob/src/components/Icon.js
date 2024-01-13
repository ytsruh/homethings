import React from "react";
import Icon from "react-native-vector-icons/Octicons";

export default function CustomIcon(props) {
  return <Icon name={props.name} size={props.size} color={props.color} />;
}

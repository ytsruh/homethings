import React from "react";
import { Pressable } from "react-native";
import Icon from "./Icon";

export default function DeleteIcon(props) {
  return (
    <Pressable onPress={props.onPress} className="rounded-lg px-2 py-1 flex justify-center items-center">
      <Icon name="trash" color="red" size={22} />
    </Pressable>
  );
}

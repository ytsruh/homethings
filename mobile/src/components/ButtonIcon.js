import * as React from "react";
import { Text, Pressable } from "react-native";
import Icon from "./Icon";

export default function ButtonIcon(props) {
  if (props.secondary) {
    return (
      <Pressable
        onPress={props.onPress}
        className="bg-coal rounded-lg px-5 py-3 flex justify-center items-center"
      >
        <Icon name={props.icon} color="#fff" size={props.size} />
      </Pressable>
    );
  }
  if (props.warning) {
    return (
      <Pressable
        onPress={props.onPress}
        className="bg-warning rounded-lg px-5 py-2 flex justify-center items-center"
      >
        <Icon name={props.icon} color="#fff" size={props.size} />
      </Pressable>
    );
  }
  return (
    <Pressable
      onPress={props.onPress}
      className="bg-primary rounded-lg px-5 py-2 flex justify-center items-center"
    >
      <Icon name={props.icon} color="#fff" size={props.size} />
    </Pressable>
  );
}

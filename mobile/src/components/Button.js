import * as React from "react";
import { Text, Pressable } from "react-native";

export default function Button(props) {
  if (props.secondary) {
    return (
      <Pressable onPress={props.onPress} className="bg-coal rounded-lg px-5 py-3 w-full">
        <Text className="text-salt text-base text-center">{props.text}</Text>
      </Pressable>
    );
  }
  return (
    <Pressable onPress={props.onPress} className="bg-primary rounded-lg px-5 py-3 w-full">
      <Text className="text-salt text-base text-center">{props.text}</Text>
    </Pressable>
  );
}

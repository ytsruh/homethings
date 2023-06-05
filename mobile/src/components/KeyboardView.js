import React, { useState, useEffect } from "react";
import { KeyboardAvoidingView } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";

export default function KeyboardView(props) {
  // Have to offset the keyboard height by the header height becuase of React Navigation library
  const height = useHeaderHeight();
  return (
    <KeyboardAvoidingView
      className={props.styles}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={height + props.offset ? props.offset : 50}
    >
      {props.children}
    </KeyboardAvoidingView>
  );
}

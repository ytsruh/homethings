import React from "react";
import { View, Text, Image } from "react-native";

const Header = (props) => {
  return (
    <View>
      <View className="flex justify-center items-center py-3">
        <Text className="text-primary text-5xl text-center">{props.title}</Text>
        <Text className="text-md text-slate text-center mx-10">{props.text}</Text>
      </View>
      <Image source={props.img} className="h-48 landscape:h-48 w-full" />
    </View>
  );
};

Header.defaultProps = {
  title: "Title",
  text: "Description of the page",
  img: null,
};

export default Header;

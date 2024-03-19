import React, { useContext } from "react";
import { Text, View } from "react-native";
import { AuthContext } from "../context/AuthContext";
import { APP_VERSION } from "../config";
import img from "../assets/account.jpg";
import Button from "../components/Button";
import Header from "../components/Header";

export default function Account(props) {
  const { logout } = useContext(AuthContext);

  return (
    <View className="h-full bg-salt landscape:flex-none landscape:my-2">
      <Header title="Account" img={img} text="Your account & profile" />

      <View className="p-3 flex-auto justify-between">
        <View>
          <Text className="text-primary text-center text-xl py-5">
            App Version : <Text className="text-lg text-slate">{APP_VERSION}</Text>
          </Text>
          <Button onPress={() => props.navigation.navigate("Feedback")} secondary text="Give Feedback" />
        </View>
        <View className="">
          <Button onPress={logout} text="Logout" />
        </View>
      </View>
    </View>
  );
}

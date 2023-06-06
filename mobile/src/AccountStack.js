import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Account from "./screens/Account";
import GiveFeedback from "./screens/GiveFeedback";

const Stack = createNativeStackNavigator();

export default function AccountStack() {
  return (
    <Stack.Navigator
      initialRouteName="Account Home"
      screenOptions={({ route }) => ({
        headerShown: false,
      })}
    >
      <Stack.Screen name="Account Home" component={Account} />
      <Stack.Screen
        name="Feedback"
        component={GiveFeedback}
        options={({ route }) => ({
          title: "Feedback",
          headerBackVisible: true,
          headerBackTitle: "Back",
          headerShown: true,
        })}
      />
    </Stack.Navigator>
  );
}

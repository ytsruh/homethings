import "react-native-gesture-handler"; // Include to avoid crashes on app load
import React, { useContext, useEffect, useState } from "react";
import { SafeAreaView } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "./context/AuthContext";
import Icon from "./components/Icon";
import Loading from "./components/Loading";
import LoginScreen from "./screens/LoginScreen";
import BooksStack from "./BooksStack";
import AccountStack from "./AccountStack";

const Tab = createBottomTabNavigator();

const MainApp = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: "#D6220E",
        tabBarInactiveTintColor: "#3f3f46",
        tabBarActiveBackgroundColor: "#f9fafb",
        tabBarInactiveBackgroundColor: "#f9fafb",
        headerShown: false,
        tabBarStyle: { marginBottom: 5 },
      })}>
      <Tab.Screen
        name="Books"
        component={BooksStack}
        options={{
          tabBarIcon: ({ focused, color, size }) => {
            return <Icon name="book" color={color} size={size} />;
          },
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountStack}
        options={{
          tabBarIcon: ({ focused, color, size }) => {
            return <Icon name="gear" color={color} size={size} />;
          },
        }}
      />
    </Tab.Navigator>
  );
};

const MainStack = (props) => {
  const { userToken, setUserToken, logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  console.log("Token : " + userToken);
  const isLoggedIn = async () => {
    try {
      if (!userToken) {
        // Token is not set in state so need to check in storage
        const token = await AsyncStorage.getItem("userToken");
        if (!token) {
          throw Error("Token is not stored");
        }
        const parsedToken = JSON.parse(token);
        // Token is ok so can be set to global state
        if (parsedToken) {
          setUserToken(parsedToken);
          setLoading(false);
          return;
        }
        // Token is either not valid or has expired
        await logout();
        throw new Error("Token is stored but has expired");
      }
    } catch (err) {
      console.log(err);
      await logout();
      setLoading(false);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, [userToken]);

  if (loading) {
    return <Loading />;
  }

  if (userToken) {
    return (
      <SafeAreaView className="flex-1 bg-salt">
        <NavigationContainer>
          <MainApp />
        </NavigationContainer>
      </SafeAreaView>
    );
  }

  return <LoginScreen />;
};

export default MainStack;

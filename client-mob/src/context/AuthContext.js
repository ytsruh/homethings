import React, { createContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../config";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState();

  const login = async (email, password) => {
    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });
      //Check for ok response
      if (!response.ok) {
        //Throw error if not ok
        throw Error("error logging in");
      }
      // Set to json, put token in storage & redirect
      const data = await response.json();
      setUserToken(data.token);
      AsyncStorage.setItem("userToken", JSON.stringify(data.token));
    } catch (err) {
      console.log("failed");
      console.log(err);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("userToken");
    setUserToken(null);
  };

  return (
    <AuthContext.Provider value={{ login, logout, userToken, setUserToken }}>{children}</AuthContext.Provider>
  );
};

import 'react-native-gesture-handler'; // Include to avoid crashes on app load
import React, { useCallback, useEffect, useState } from "react";
import { AuthProvider } from "./src/context/AuthContext";
import { Audio } from "expo-av";
import MainStack from "./src/MainStack";

export default function App() {
  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
  }, []);

  return (
    <AuthProvider>
      <MainStack />
    </AuthProvider>
  );
}

import * as React from "react";
import { KeyboardAvoidingView, ScrollView, View, Text, TextInput, Image, Platform } from "react-native";
import Button from "../components/Button";
import Loading from "../components/Loading";
import loginImg from "../assets/login.jpg";
import { AuthContext } from "../context/AuthContext";

export default function LoginScreen() {
  const [loading, setLoading] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const { login } = React.useContext(AuthContext);

  async function handleLogin() {
    setLoading(true);
    await login(email, password);
    setLoading(false);
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
      <ScrollView className="flex-1 py-16 px-3 bg-salt landscape:flex-none landscape:my-2">
        <View>
          <Text className="text-4xl text-center text-primary my-3">Welcome to Homethings</Text>
        </View>
        <Image source={loginImg} className="h-96 landscape:h-48 w-full rounded-lg " />
        <TextInput
          placeholder="Email"
          placeholderTextColor="#36393B"
          autoCapitalize="none"
          onChangeText={(text) => setEmail(text)}
          className="my-3 p-3 border border-coal rounded-lg"
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#36393B"
          secureTextEntry={true}
          onChangeText={(text) => setPassword(text)}
          className="my-3 p-3 border border-coal rounded-lg"
        />
        <View className="py-3">
          <Button text="Login" onPress={() => handleLogin()} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

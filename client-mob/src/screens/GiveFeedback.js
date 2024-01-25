import React, { useState, useEffect, useContext } from "react";
import {
  KeyboardAvoidingView,
  ScrollView,
  View,
  Text,
  TextInput,
  Image,
  TouchableWithoutFeedback,
} from "react-native";
import { BASE_URL, getToken } from "../config";
import Button from "../components/Button";
import Loading from "../components/Loading";
import { AuthContext } from "../context/AuthContext";

export default function GiveFeedback(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({ read: false });
  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);
  const { logout } = useContext(AuthContext);

  const submit = async () => {
    if (!data.title) {
      setError(true);
      return;
    }
    try {
      let token = await getToken();
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(data),
      });
      //Check for ok response
      if (response.status === 401) {
        throw Error("unauthorized");
      }
      const responseData = await response.json();
      setIsLoading(false);
      props.navigation.navigate({
        name: "Account Home",
      });
    } catch (error) {
      if (err.message === "unauthorized") {
        logout();
      }
      console.log(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (data.read) {
      setShow(true);
    } else {
      setShow(false);
    }
  }, [data.read]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-salt h-full px-3">
      {!error ? (
        <ScrollView className="flex-1 py-2 bg-salt landscape:flex-none landscape:my-2">
          <Text className="text-sm pb-1 pt-2 text-coal">Title</Text>
          <TextInput
            placeholder="Title (required)"
            placeholderTextColor="#36393B"
            autoCapitalize="sentences"
            onChangeText={(text) => setData({ ...data, title: text })}
            className="mb-3 p-3 border border-coal rounded-lg"
          />
          <Text className="text-sm pb-1 pt-2 text-coal">Body</Text>
          <TextInput
            placeholder="Description (optional)"
            placeholderTextColor="#36393B"
            autoCapitalize="sentences"
            multiline={true}
            onChangeText={(text) => setData({ ...data, body: text })}
            className="mb-3 p-3 border border-coal rounded-lg h-24"
          />
          <View className="flex-1 items-center py-5">
            <Button text="Send" secondary={true} onPress={() => submit()} />
          </View>
        </ScrollView>
      ) : (
        <View className="flex-1 justify-center items-center px-5">
          <Text className="py-5 text-primary text-lg">
            Error:
            <Text className="text-coal text-base"> Please make sure that the Title field is completed</Text>
          </Text>
          <Button text="Ok" secondary={true} onPress={() => setError(false)} />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

import React, { useState, useEffect, useContext } from "react";
import { ScrollView, View, Text, TextInput, Image, TouchableWithoutFeedback } from "react-native";
import { BASE_URL, getToken } from "../config";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import Button from "./Button";
import Loading from "./Loading";
import KeyboardView from "./KeyboardView";
import { AuthContext } from "../context/AuthContext";

export default function CreateBookManual(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({ read: false });
  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);
  const { logout } = useContext(AuthContext);

  const submit = async () => {
    if (!data.name || !data.isbn) {
      setError(true);
      return;
    }
    try {
      let token = await getToken();
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/books`, {
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
      setIsLoading(false);
      props.navigation.navigate({
        name: "All Books",
        params: { refresh: true },
      });
    } catch (error) {
      if (error.message === "unauthorized") {
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
    <KeyboardView styles="flex-1 bg-salt h-full px-3" offset={100}>
      {!error ? (
        <ScrollView className="flex py-2 bg-salt landscape:flex-none landscape:my-2">
          <Text className="text-sm pb-1 pt-2 text-coal">Name</Text>
          <TextInput
            placeholder="Name (required)"
            placeholderTextColor="#36393B"
            autoCapitalize="sentences"
            onChangeText={(text) => setData({ ...data, name: text })}
            className="mb-3 p-3 border border-coal rounded-lg"
          />
          <Text className="text-sm pb-1 pt-2 text-coal">ISBN</Text>
          <TextInput
            placeholder="ISBN (required)"
            placeholderTextColor="#36393B"
            autoCapitalize="sentences"
            onChangeText={(text) => setData({ ...data, isbn: text })}
            className="mb-3 p-3 border border-coal rounded-lg"
          />
          <Text className="text-sm pb-1 pt-2 text-coal">Author</Text>
          <TextInput
            placeholder="Author"
            placeholderTextColor="#36393B"
            autoCapitalize="sentences"
            onChangeText={(text) => setData({ ...data, author: text })}
            className="mb-3 p-3 border border-coal rounded-lg"
          />
          <Text className="text-sm pb-1 pt-2 text-coal">Genre</Text>
          <TextInput
            placeholder="Genre"
            placeholderTextColor="#36393B"
            autoCapitalize="sentences"
            onChangeText={(text) => setData({ ...data, genre: text })}
            className="mb-3 p-3 border border-coal rounded-lg"
          />
          <View className="mb-3 py-2">
            <Text className="mb-2">Wishlist: </Text>
            <SegmentedControl
              values={["True", "False"]}
              selectedIndex={1}
              onChange={(event) => {
                setData({ ...data, wishlist: event.nativeEvent.selectedSegmentIndex === 0 ? true : false });
              }}
            />
          </View>
          <View className="mb-3 py-2">
            <Text className="mb-2">Read: </Text>
            <SegmentedControl
              values={["True", "False"]}
              selectedIndex={data.read ? 0 : 1}
              onChange={(event) => {
                setData({ ...data, read: event.nativeEvent.selectedSegmentIndex === 0 ? true : false });
              }}
            />
          </View>
          {show ? (
            <View className="mb-3 py-2">
              <Text className="mb-2">Rating: </Text>
              <SegmentedControl
                values={["1", "2", "3", "4", "5"]}
                onChange={(event) => {
                  setData({ ...data, rating: event.nativeEvent.selectedSegmentIndex + 1 });
                }}
              />
            </View>
          ) : null}
          <View className="flex-1 items-center py-5">
            <Button text="Create" secondary={true} onPress={() => submit()} />
          </View>
        </ScrollView>
      ) : (
        <View className="flex-1 justify-center items-center px-5">
          <Text className="py-5 text-primary text-lg">
            Error:
            <Text className="text-coal text-base">
              {" "}
              Please make sure that both Author & ISBN fields are completed
            </Text>
          </Text>
          <Button text="Ok" secondary={true} onPress={() => setError(false)} />
        </View>
      )}
    </KeyboardView>
  );
}

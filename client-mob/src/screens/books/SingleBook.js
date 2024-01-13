import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, TextInput, Platform } from "react-native";
import Button from "../../components/Button";
import Loading from "../../components/Loading";
import ButtonIcon from "../../components/ButtonIcon";
import { BASE_URL, getToken } from "../../config";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import DeleteIcon from "../../components/DeleteIcon";
import KeyboardView from "../../components/KeyboardView";

export default function SingleBook(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(props.route.params.data);
  const [show, setShow] = useState();

  useEffect(() => {
    if (data.read) {
      setShow(true);
    } else {
      setShow(false);
    }
  }, [data.read]);

  useEffect(() => {
    props.navigation.setOptions({
      headerRight: () => (
        <DeleteIcon
          onPress={() => {
            props.navigation.navigate("Delete", { data });
          }}
        />
      ),
    });
  }, [props.navigation]);

  const submit = async () => {
    if (!data.name || !data.isbn) {
      setError(true);
      return;
    }
    try {
      let token = await getToken();
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/books/${data.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
        body: JSON.stringify(data),
      });
      //Check for ok response
      if (!response.ok) {
        throw Error(response.statusText);
      }
      const responseData = await response.json();
      setIsLoading(false);
      props.navigation.navigate({
        name: "All Books",
        params: { refresh: true },
      });
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <KeyboardView styles="flex-1 bg-salt h-full w-full">
      <ScrollView className="flex-1 py-2 px-3 bg-salt landscape:flex-none landscape:my-2">
        <Text className="text-sm pb-1 pt-2 text-coal">Name</Text>
        <TextInput
          placeholder="Name (required)"
          value={data.name}
          placeholderTextColor="#36393B"
          autoCapitalize="sentences"
          onChangeText={(text) => setData({ ...data, name: text })}
          className="mb-3 p-3 border border-coal rounded-lg"
        />
        <Text className="text-sm pb-1 pt-2 text-coal">ISBN</Text>
        <TextInput
          placeholder="ISBN (required)"
          value={data.isbn}
          placeholderTextColor="#36393B"
          autoCapitalize="sentences"
          onChangeText={(text) => setData({ ...data, isbn: text })}
          className="mb-3 p-3 border border-coal rounded-lg"
        />
        <Text className="text-sm pb-1 pt-2 text-coal">Author</Text>
        <TextInput
          placeholder="Author"
          value={data.author}
          placeholderTextColor="#36393B"
          autoCapitalize="sentences"
          onChangeText={(text) => setData({ ...data, author: text })}
          className="mb-3 p-3 border border-coal rounded-lg"
        />
        <Text className="text-sm pb-1 pt-2 text-coal">Genre</Text>
        <TextInput
          placeholder="Genre"
          value={data.genre}
          placeholderTextColor="#36393B"
          autoCapitalize="sentences"
          onChangeText={(text) => setData({ ...data, genre: text })}
          className="mb-3 p-3 border border-coal rounded-lg"
        />
        <View className="mb-3 py-2">
          <Text className="mb-2">Wishlist: </Text>
          <SegmentedControl
            values={["True", "False"]}
            selectedIndex={data.wishlist ? 0 : 1}
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
              selectedIndex={data.rating - 1}
              onChange={(event) => {
                setData({ ...data, rating: event.nativeEvent.selectedSegmentIndex + 1 });
              }}
            />
          </View>
        ) : null}
        <View className="py-5">
          <Button text="Update" secondary={true} onPress={() => submit()} />
        </View>
      </ScrollView>
    </KeyboardView>
  );
}

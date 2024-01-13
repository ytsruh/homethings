import React, { useState, useEffect } from "react";
import { Text, View, Image } from "react-native";
import Button from "./Button";
import ButtonIcon from "./ButtonIcon";
import Loading from "./Loading";
import { BASE_URL, getToken } from "../config";

export default function ResultTile(props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    try {
      let token = await getToken();
      setLoading(true);
      const response = await fetch(`${BASE_URL}/books`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
        body: JSON.stringify({
          name: props.data.title,
          author: props.data.by_statement,
          isbn: props.data.isbn_13[0],
          image: `https://covers.openlibrary.org/b/isbn/${props.data.isbn_13[0]}-M.jpg`,
        }),
      });
      //Check for ok response
      if (!response.ok) {
        throw new Error("Something went wrong please try again");
      }
      setLoading(false);
      props.navigation.navigate({
        name: "All Books",
        params: { refresh: true },
      });
    } catch (error) {
      console.log(error);
      setError(error);
      setLoading(false);
    }
  }

  if (loading) return <LoadingTile />;
  if (error) return <ErrorTile error={error} />;

  return (
    <View className="flex justify-center items-center w-full">
      <Image
        source={{
          uri: props.data.isbn_13
            ? `https://covers.openlibrary.org/b/isbn/${props.data.isbn_13[0]}-M.jpg`
            : "https://fakeimg.pl/72x128?text=?&font=noto",
        }}
        className="h-72 w-1/2 mt-4"
      />
      <Text className="text-center text-xl p-2 mx-3">{props.data.title}</Text>
      <Text className="text-center text-base p-2 mx-3">{props.data.by_statement}</Text>
      <View className="flex flex-row justify-between items-center w-full px-3">
        <View className="basis-3/4 px-2">
          <Button secondary text="Add to library" onPress={() => handleSubmit()} />
        </View>
        <View className="basis-1/4 px-2">
          <ButtonIcon icon="circle-slash" size={18} warning onPress={() => props.setResult()} />
        </View>
      </View>
    </View>
  );
}

function LoadingTile() {
  return (
    <View className="flex w-full h-full justify-center items-center">
      <Loading />
    </View>
  );
}

function ErrorTile(props) {
  return (
    <View className="flex w-full h-full justify-center items-center">
      <Text className="text-red-500 text-center text-lg">{props.error}</Text>
    </View>
  );
}

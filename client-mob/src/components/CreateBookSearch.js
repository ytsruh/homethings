import React, { useState, useEffect } from "react";
import { ScrollView, View, TextInput, Text, Image } from "react-native";
import Button from "./Button";
import ButtonIcon from "./ButtonIcon";
import Loading from "./Loading";
import KeyboardView from "./KeyboardView";
import { BASE_URL, getToken } from "../config";

export default function CreateBookSearch(props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isbn, setISBN] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    setTimeout(() => setError(""), 1500);
  }, [error]);

  async function search() {
    setResult(null);
    if (!isbn) {
      setError("Please enter an ISBN");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`https://openlibrary.org/isbn/${isbn.trim()}.json`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Book not found");
        }
        throw new Error("Something went wrong");
      }
      const book = await response.json();
      setResult(book);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <KeyboardView styles="flex-1">
      <ScrollView>
        <View className="flex flex-row justify-center items-center pb-2 px-3">
          <TextInput
            className="basis-2/3 p-3 border border-coal rounded-lg"
            placeholder="Search by ISBN"
            placeholderTextColor="#36393B"
            autoCapitalize="sentences"
            onChangeText={(text) => setISBN(text)}
            keyboardType="numeric"
          />
          <View className="basis-1/3 ml-2 flex flex-row justify-between">
            <ButtonIcon icon="search" size={18} secondary onPress={() => search()} />
            <ButtonIcon
              icon="project"
              size={18}
              secondary
              onPress={() =>
                props.navigation.navigate({
                  name: "BarcodeScanner",
                })
              }
            />
          </View>
        </View>
        <View className="flex justify-between items-center">
          {loading && <LoadingTile />}
          {error && <ErrorTile error={error} />}
          {result && (
            <ResultTile
              data={result}
              setResult={setResult}
              setLoading={setLoading}
              setError={setError}
              navigation={props.navigation}
            />
          )}
        </View>
      </ScrollView>
    </KeyboardView>
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

function ResultTile(props) {
  async function handleSubmit() {
    try {
      let token = await getToken();
      props.setLoading(true);
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
      props.setLoading(false);
      props.navigation.navigate({
        name: "All Books",
        params: { refresh: true },
      });
    } catch (error) {
      console.log(error);
      props.setError(error);
      props.setLoading(false);
    }
  }

  return (
    <View className="flex justify-center items-center w-full">
      <Image
        source={{ uri: `https://covers.openlibrary.org/b/isbn/${props.data.isbn_13[0]}-M.jpg` }}
        className="h-72 w-1/2 mt-4"
      />
      <Text className="text-center text-xl p-2 mx-3">{props.data.title}</Text>
      <Text className="text-center text-base p-2 mx-3">{props.data.by_statement}</Text>
      <View className="flex flex-row justify-between items-center w-full px-3">
        <View className="basis-3/4 px-2">
          <Button secondary text="Add to library" onPress={() => handleSubmit()} />
        </View>
        <View className="basis-1/4 px-2">
          <ButtonIcon icon="circle-slash" size={18} warning onPress={() => props.setResult(null)} />
        </View>
      </View>
    </View>
  );
}

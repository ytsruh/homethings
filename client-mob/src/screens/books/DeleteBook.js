import React, { useState, useContext } from "react";
import { View, Text } from "react-native";
import Button from "../../components/Button";
import { BASE_URL, getToken } from "../../config";
import Loading from "../../components/Loading";
import { AuthContext } from "../../context/AuthContext";

export default function DeleteBook(props) {
  const data = props.route.params.data;
  const [isLoading, setIsLoading] = useState(false);
  const { logout } = useContext(AuthContext);

  async function confirmDelete() {
    let token = await getToken();
    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/books/${data.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });
      //Check for ok response
      if (response.status === 401) {
        throw Error("unauthorized");
      }
      const responseData = await response.json();
      setIsLoading(false);
      props.navigation.navigate({
        name: "All Books",
        params: { refresh: true },
      });
    } catch (error) {
      if (err.message === "unauthorized") {
        logout();
      }
      console.log(error);
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <View className="flex-1 bg-salt h-full">
      <View className="flex-1 justify-center items-center mx-5">
        <Text className="py-2 text-center">
          Are you sure you want to delete this book? This cannot be done
        </Text>
        <Button text="Confirm" onPress={() => confirmDelete()} />
      </View>
    </View>
  );
}

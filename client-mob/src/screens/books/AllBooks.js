import React, { useState, useEffect, useContext } from "react";
import { KeyboardAvoidingView, View, Text, TextInput, Image, TouchableWithoutFeedback } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "../../context/AuthContext";
import Button from "../../components/Button";
import Loading from "../../components/Loading";
import Header from "../../components/Header";
import img from "../../assets/books.jpg";
import { BASE_URL, getToken } from "../../config";
import { FlatList } from "react-native-gesture-handler";
import ButtonIcon from "../../components/ButtonIcon";
import Icon from "../../components/Icon";

export default function AllBooks(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { logout } = useContext(AuthContext);

  const fetchData = async () => {
    setIsLoading(true);
    let token = await getToken();
    try {
      const response = await fetch(`${BASE_URL}/books`, {
        headers: { Authorization: token },
      });
      //Check for ok response
      if (response.status === 401) {
        throw Error("unauthorized");
      }
      // Set to json and store in state
      const data = await response.json();
      setData(data.books);
      setIsLoading(false);
    } catch (err) {
      if (err.message === "unauthorized") {
        logout();
      }
      console.log(err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [props.route]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 h-full bg-salt landscape:flex-none landscape:my-2"
      behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <FlatList
        data={
          setSearchTerm
            ? data.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
            : data
        }
        renderItem={({ item }) => <BookItem data={item} navigation={props.navigation} />}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<PageHeader navigation={props.navigation} setSearchTerm={setSearchTerm} />}
        ListEmptyComponent={<ListEmpty />}
      />
    </KeyboardAvoidingView>
  );
}

const PageHeader = (props) => {
  const [showSearch, setShowSearch] = useState(false);
  const toggleSearch = async () => {
    setShowSearch(!showSearch);
  };
  return (
    <View>
      <Header title="Books" img={img} text="Your personal book collection" />
      <View className="flex flex-row justify-between pt-3 px-3">
        <ButtonIcon icon="plus" size={18} secondary onPress={() => props.navigation.navigate("New Book")} />
        <ButtonIcon icon="search" size={18} secondary onPress={() => toggleSearch()} />
        <ButtonIcon icon="star" size={18} secondary onPress={() => props.navigation.navigate("Wishlist")} />
        <ButtonIcon
          icon="list-unordered"
          size={18}
          secondary
          onPress={() => props.navigation.navigate("BookLists")}
        />
      </View>
      {showSearch ? (
        <View className="px-1 py-3 flex-1 justify-center items-center">
          <TextInput
            placeholder="Search or filter"
            placeholderTextColor="#36393B"
            autoCapitalize="none"
            onChangeText={(text) => props.setSearchTerm(text)}
            className="pt-2 pb-3 px-2 border border-slate rounded-md text-base w-full"
          />
        </View>
      ) : null}
    </View>
  );
};

const BookItem = (props) => {
  return (
    <TouchableWithoutFeedback onPress={() => props.navigation.navigate("Book", { data: props.data })}>
      <View className="px-3 py-5 flex-row justify-between items-center border-b border-slate">
        {props.data.read ? (
          <Icon name="eye" color="#000" size={20} />
        ) : (
          <Icon name="eye-closed" color="#000" size={20} />
        )}
        <Text className="flex-1 text-lg mx-2 whitespace-normal truncate" numberOfLines={1}>
          {props.data.name}
        </Text>
        <Icon name="chevron-right" color="#3f3f46" size={20} />
      </View>
    </TouchableWithoutFeedback>
  );
};

const ListEmpty = () => {
  return (
    <View className="flex flex-col items-center justify-center py-10">
      <Text className="text-xl text-center">
        You don't have any books yet. Add some books to get started.
      </Text>
    </View>
  );
};

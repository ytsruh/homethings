import React, { useState, useEffect, useContext } from "react";
import { View, Text, TouchableWithoutFeedback } from "react-native";
import Loading from "../../components/Loading";
import { BASE_URL, getToken } from "../../config";
import { FlatList } from "react-native-gesture-handler";
import Icon from "../../components/Icon";
import { AuthContext } from "../../context/AuthContext";

export default Wishlist = (props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const { logout } = useContext(AuthContext);

  const fetchData = async () => {
    setIsLoading(true);
    let token = await getToken();
    try {
      const response = await fetch(`${BASE_URL}/books/wishlist`, {
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
    <View className="h-full bg-salt landscape:flex-none landscape:my-2">
      <FlatList
        data={data}
        renderItem={({ item }) => <BookItem data={item} navigation={props.navigation} />}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<ListEmpty />}
      />
    </View>
  );
};

const BookItem = (props) => {
  return (
    <TouchableWithoutFeedback onPress={() => props.navigation.navigate("Book", { data: props.data })}>
      <View className="px-3 py-5 flex-row justify-between items-center border-b border-slate">
        <Icon name="star" color="#000" size={20} />
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
    <View className="flex-1 items-center justify-center py-10">
      <Text className="text-xl text-center px-4">You don't have any books on your wishlist yet.</Text>
    </View>
  );
};

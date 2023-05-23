import React, { useState, useEffect } from "react";
import { View, Text, TouchableWithoutFeedback } from "react-native";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { FlatList } from "react-native-gesture-handler";
import { BASE_URL, getToken } from "../../config";
import Loading from "../../components/Loading";
import Icon from "../../components/Icon";

export default BookLists = (props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [read, setRead] = useState(true);
  const [data, setData] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    let token = await getToken();
    try {
      const response = await fetch(`${BASE_URL}/books/${read ? "read" : "unread"}`, {
        headers: { token: token },
      });
      //Check for ok response
      if (!response.ok) {
        //Throw error if not ok
        throw Error(response.statusText);
      }
      // Set to json and store in state
      const books = await response.json();
      setData(books.data);
      setIsLoading(false);
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [read]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <View className="flex h-full bg-salt">
      <View className="m-3">
        <SegmentedControl
          values={["Read", "Unread"]}
          selectedIndex={read ? 0 : 1}
          onChange={(event) => {
            setRead(event.nativeEvent.selectedSegmentIndex === 0 ? true : false);
          }}
        />
      </View>
      <FlatList
        data={data}
        renderItem={({ item }) => <BookItem data={item} navigation={props.navigation} type={read} />}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<ListEmpty type={read} />}
      />
    </View>
  );
};

const BookItem = (props) => {
  return (
    <TouchableWithoutFeedback onPress={() => props.navigation.navigate("Book", { data: props.data })}>
      <View className="px-3 py-5 flex-row justify-between items-center border-b border-slate">
        <Icon name={props.type ? "eye" : "eye-closed"} color="#000" size={20} />
        <Text className="flex-1 text-lg mx-2 whitespace-normal truncate" numberOfLines={1}>
          {props.data.name}
        </Text>
        <Icon name="chevron-right" color="#3f3f46" size={20} />
      </View>
    </TouchableWithoutFeedback>
  );
};

const ListEmpty = (props) => {
  return (
    <View className="flex-1 items-center justify-center py-10">
      <Text className="text-xl text-center px-4">
        You don't have any books on your {props.type ? "read" : "unread"} list yet.
      </Text>
    </View>
  );
};

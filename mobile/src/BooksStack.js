import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Text } from "react-native";
import AllBooks from "./screens/books/AllBooks";
import CreateBook from "./screens/books/CreateBook";
import SingleBook from "./screens/books/SingleBook";
import DeleteBook from "./screens/books/DeleteBook";
import DeleteIcon from "./components/DeleteIcon";
import Wishlist from "./screens/books/Wishlist";
import BookLists from "./screens/books/BookLists";

const Stack = createNativeStackNavigator();

export default function BooksStack() {
  return (
    <Stack.Navigator
      initialRouteName="All Books"
      screenOptions={({ route }) => ({
        headerShown: false,
      })}
    >
      <Stack.Screen name="All Books" component={AllBooks} />
      <Stack.Screen
        name="New Book"
        component={CreateBook}
        options={({ route }) => ({
          title: "Add a new book",
          headerBackVisible: true,
          headerBackTitle: "Back",
          headerShown: true,
        })}
      />
      <Stack.Screen
        name="Book"
        component={SingleBook}
        options={({ route }) => ({
          title: route.params.data.name,
          headerBackVisible: true,
          headerShown: true,
          headerRight: () => <DeleteIcon />,
        })}
      />
      <Stack.Screen
        name="Search"
        component={SearchBook}
        options={({ route }) => ({
          title: "Search",
          headerBackVisible: true,
          headerShown: true,
        })}
      />
      <Stack.Screen
        name="Delete"
        component={DeleteBook}
        options={({ route }) => ({
          title: "",
          headerBackVisible: true,
          headerShown: true,
        })}
      />
      <Stack.Screen
        name="Wishlist"
        component={Wishlist}
        options={({ route }) => ({
          title: "Wishlist",
          headerBackVisible: true,
          headerShown: true,
        })}
      />
      <Stack.Screen
        name="BookLists"
        component={BookLists}
        options={({ route }) => ({
          title: "Read / Unread",
          headerBackVisible: true,
          headerShown: true,
        })}
      />
    </Stack.Navigator>
  );
}

const SearchBook = () => {
  return (
    <View className="flex-1 bg-salt h-full">
      <View className="flex-1 justify-center items-center">
        <Text>Search Open Books for a new book</Text>
      </View>
    </View>
  );
};

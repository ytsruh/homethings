import AsyncStorage from "@react-native-async-storage/async-storage";

export const BASE_URL = "https://homethings-api.ytsruh.com/v1";
//export const BASE_URL = "http://192.168.68.112:3000/api";
//export const BASE_URL = "http://localhost:1323/v1";
export const APP_VERSION = "0.3";

export const getToken = async () => {
  const storedToken = await AsyncStorage.getItem("userToken");
  const token = await JSON.parse(storedToken);
  return token;
};

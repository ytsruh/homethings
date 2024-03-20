import AsyncStorage from "@react-native-async-storage/async-storage";

export const BASE_URL = "https://homethings.ytsruh.com/api";
//export const BASE_URL = "http://192.168.68.112:3000/api";
export const APP_VERSION = "0.2";

export const getToken = async () => {
  const storedToken = await AsyncStorage.getItem("userToken");
  const parsed = await JSON.parse(storedToken);
  return parsed.token;
};

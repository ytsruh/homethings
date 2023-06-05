import AsyncStorage from "@react-native-async-storage/async-storage";

export const BASE_URL = 'https://homethings.ytsruh.com/api';
//export const BASE_URL = "http://localhost:3000/api";
export const APP_VERSION = "0.1";

export const getToken = async () => {
  const storedToken = await AsyncStorage.getItem("userToken");
  const parsed = await JSON.parse(storedToken);
  return parsed.token;
};

export const IMAGE_BASE_URL = "https://ytsruh.ams3.cdn.digitaloceanspaces.com/homethings";

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const secureStoreOptions: SecureStore.SecureStoreOptions = {
  keychainService: "hms-refresh-token",
};

export const saveToken = async (token: string) => {
  await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const saveRefreshToken = async (token: string) => {
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token, secureStoreOptions);
};

export const saveTokens = async (accessToken: string, refreshToken: string) => {
  await Promise.all([
    AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken),
    saveRefreshToken(refreshToken),
  ]);
};

export const getToken = async () => {
  return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = async () => {
  const secureToken = await SecureStore.getItemAsync(
    REFRESH_TOKEN_KEY,
    secureStoreOptions,
  );

  if (secureToken) {
    return secureToken;
  }

  const legacyToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);

  if (legacyToken) {
    await saveRefreshToken(legacyToken);
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  return legacyToken;
};

export const removeToken = async () => {
  await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
};

export const removeTokens = async () => {
  await Promise.all([
    AsyncStorage.removeItem(ACCESS_TOKEN_KEY),
    AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY, secureStoreOptions),
  ]);
};

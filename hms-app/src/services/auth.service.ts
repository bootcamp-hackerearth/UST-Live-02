import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LoginRequestModel, SignUpRequestModel } from "../types/auth.types";
import { getPatientId } from "./user.service";
import api from "./interceptor.service";

export const login = async (data: LoginRequestModel) => {
  const response = await api.post("auth/login", data);

  const token = response.data.token;
  const email = response.data.email;

  await SecureStore.setItemAsync("token", token);
  await AsyncStorage.setItem("email", email);

  const patientId = await getPatientId(email);
  await AsyncStorage.setItem("patientId", patientId);

  return response;
};

export const signUp = async (data: SignUpRequestModel) => {
  const response = await api.post(
    "auth/patientSignUp",
    data,
  );
  return response;
};

export const setToken = async (token: string) => {
  try {
    await SecureStore.setItemAsync("token", token);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const getToken = async () => {
  try {
    const token = await SecureStore.getItemAsync("token");
    return token;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const deleteToken = async () => {
  try {
    await SecureStore.deleteItemAsync("token");
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const clearSecureStorage = async () => {
  try {
    await AsyncStorage.removeItem("email");
    await AsyncStorage.removeItem("patientId");
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const logout = async () => {
  try {
    await deleteToken();
    await clearSecureStorage();
  } catch (err) {
    throw err;
  }
};

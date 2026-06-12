import * as SecureStore from "expo-secure-store";

export const saveLoginData = async (token, user, patient) => {
  try {
    await SecureStore.setItemAsync("token", token);
    await SecureStore.setItemAsync("user", JSON.stringify(user));
    await SecureStore.setItemAsync("patient", JSON.stringify(patient));
  } catch (error) {
    console.log("Storage Error:", error);
  }
};

export const getToken = async () => {
  return await SecureStore.getItemAsync("token");
};

export const getUser = async () => {
  const user = await SecureStore.getItemAsync("user");

  return user ? JSON.parse(user) : null;
};

export const getPatient = async () => {
  const patient = await SecureStore.getItemAsync("patient");

  return patient ? JSON.parse(patient) : null;
};

export const clearStorage = async () => {
  await SecureStore.deleteItemAsync("token");
  await SecureStore.deleteItemAsync("user");
  await SecureStore.deleteItemAsync("patient");
};

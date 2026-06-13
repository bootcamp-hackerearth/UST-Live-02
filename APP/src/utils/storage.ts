import AsyncStorage from "@react-native-async-storage/async-storage";

export const storeToken = async (token: string) => {
  try {
    await AsyncStorage.setItem("token", token);
  } catch (error) {
    console.log("Storage Error:", error);
  }
};
export const storePatientId = async (patientId: string) => {
  await AsyncStorage.setItem("patientId", patientId);
};
export const getPatientId = async (): Promise<string | null> => {
  return await AsyncStorage.getItem("patientId");
};
export const getToken = async () => {
  return await AsyncStorage.getItem("token");
};

export const removeToken = async () => {
  return await AsyncStorage.removeItem("token");
};

export const clearSession = async () => {
  await AsyncStorage.multiRemove(["token", "patientId"]);
};

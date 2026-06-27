import { useCallback, useEffect } from "react";

import { View, ActivityIndicator } from "react-native";

import { getToken } from "../storage/token.storage";

export default function SplashScreen({ navigation }: any) {
  const checkAuth = useCallback(async () => {
    const token = await getToken();

    if (token) {
      navigation.replace("PatientTabs");
    } else {
      navigation.replace("Login");
    }
  }, [navigation]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ActivityIndicator size="large" />
    </View>
  );
}

import { useCallback, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { getToken } from "../storage/token.storage";
import { getCurrentUser } from "../services/auth.service";

export default function SplashScreen({ navigation }: any) {
  const checkAuth = useCallback(async () => {
    try {
      const token = await getToken();

      if (!token) {
        navigation.replace("Login");

        return;
      }

      await getCurrentUser();

      navigation.replace("PatientTabs");
    } catch {
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

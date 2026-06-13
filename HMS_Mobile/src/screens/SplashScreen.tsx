import { useEffect } from "react";

import {
  View,
  ActivityIndicator,
} from "react-native";

import {
  getToken,
} from "../storage/token.storage";

export default function SplashScreen({
  navigation,
}: any) {

  useEffect(() => {

    checkAuth();

  }, []);

  const checkAuth =
  async () => {

    const token =
      await getToken();

    if (token) {

      navigation.replace(
        "PatientTabs"
      );

    } else {

      navigation.replace(
        "Login"
      );
    }
  };

  return (

    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >

      <ActivityIndicator
        size="large"
      />

    </View>
  );
}
import { useFonts } from "expo-font";
import AppNavigator from "./src/navigation/AppNavigator";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "react-native";
import Toast from "react-native-toast-message";

export default function App() {
  const font = useFonts({
    Sans: require("./assets/fonts/GoogleSans.ttf"),
  });

  if (!font) {
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <AppNavigator />
      <Toast />
    </SafeAreaView>
  );
}

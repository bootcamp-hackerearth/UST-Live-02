import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { navigationRef } from "./src/navigation/RootNavigation";
import { useFonts } from "expo-font";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import MainTabNavigator from "./src/navigation/MainTabNavigator";
import Toast, {
  BaseToast,
  ErrorToast,
  ToastConfig,
} from "react-native-toast-message";
import { RootStackParamList } from "./src/types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();
const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#10B981' }} 
      text2NumberOfLines={3}
      text1Style={{ fontSize: 16, fontWeight: 'bold', fontFamily: 'Lexend' }}
      text2Style={{ fontSize: 14, fontFamily: 'Lexend', color: '#4B5563' }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: '#EF4444' }} 
      text2NumberOfLines={3} 
      text1Style={{ fontSize: 16, fontWeight: 'bold', fontFamily: 'Lexend' }}
      text2Style={{ fontSize: 14, fontFamily: 'Lexend', color: '#4B5563' }}
    />
  ),
  info: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#3B82F6' }}
      text2NumberOfLines={3} 
      text1Style={{ fontSize: 16, fontWeight: 'bold', fontFamily: 'Lexend' }}
      text2Style={{ fontSize: 14, fontFamily: 'Lexend', color: '#4B5563' }}
    />
  )
};

export default function App() {
  const [fontsLoaded] = useFonts({
    Sans: require("./assets/fonts/GoogleSans.ttf"),
    Montserrat: require("./assets/fonts/Montserrat.ttf"),
    ShareTech: require("./assets/fonts/ShareTech-Regular.ttf"),
    Lexend: require("./assets/fonts/Lexend.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <SafeAreaProvider>
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>

      <Toast config={toastConfig} />
    </>
  );
}

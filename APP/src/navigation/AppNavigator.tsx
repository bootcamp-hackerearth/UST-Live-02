import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import DashboardScreen from "../screens/DashboardScreen";
import ProfileScreen from "../screens/ProfileScreen";
import AppointmentsScreen from "../screens/AppointmentsScreen";
import BookAppointmentScreen from "../screens/BookAppointmentScreen";
import { ROUTES, RouteName } from "./routes";

export type RootStackParamList = Record<RouteName, undefined>;

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={ROUTES.login}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name={ROUTES.login} component={LoginScreen} />
        <Stack.Screen name={ROUTES.signup} component={SignupScreen} />
        <Stack.Screen name={ROUTES.resetPassword} component={ResetPasswordScreen} />
        <Stack.Screen name={ROUTES.dashboard} component={DashboardScreen} />
        <Stack.Screen name={ROUTES.profile} component={ProfileScreen} />
        <Stack.Screen name={ROUTES.appointments} component={AppointmentsScreen} />
        <Stack.Screen
          name={ROUTES.bookAppointment}
          component={BookAppointmentScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

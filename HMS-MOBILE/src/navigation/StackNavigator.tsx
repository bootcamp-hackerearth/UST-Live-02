import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import DashboardScreen from "../screens/DashboardScreen";
import ProfileScreen from "../screens/ProfileScreen";
import AppointmentsScreen from "../screens/AppointmentsScreen";
import BookAppointmentScreen from "../screens/BookAppointmentScreen";

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login"            component={LoginScreen} />
      <Stack.Screen name="Signup"           component={SignupScreen} />
      <Stack.Screen name="ResetPassword"    component={ResetPasswordScreen} />
      <Stack.Screen name="Dashboard"        component={DashboardScreen} />
      <Stack.Screen name="Profile"          component={ProfileScreen} />
      <Stack.Screen name="Appointments"     component={AppointmentsScreen} />
      <Stack.Screen name="BookAppointment"  component={BookAppointmentScreen} />
    </Stack.Navigator>
  );
}
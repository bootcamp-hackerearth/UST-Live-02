import DashboardScreen from "../screens/DashboardScreen";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BookAppointmentScreen from "../screens/BookAppointmentScreen";
import AppointmentsScreen from "../screens/AppointmentsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { ROUTES, RouteName } from "./routes";

type RootStackParamList = Record<RouteName, undefined>;

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function StackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.login} component={LoginScreen} />
      <Stack.Screen name={ROUTES.signup} component={SignupScreen} />
      <Stack.Screen name={ROUTES.profile} component={ProfileScreen} />
      <Stack.Screen name={ROUTES.resetPassword} component={ResetPasswordScreen} />

       <Stack.Screen
        name={ROUTES.bookAppointment}
        component={BookAppointmentScreen}
      />
      <Stack.Screen name={ROUTES.appointments} component={AppointmentsScreen} />
      <Stack.Screen name={ROUTES.dashboard} component={DashboardScreen} />
    </Stack.Navigator>
  );
}

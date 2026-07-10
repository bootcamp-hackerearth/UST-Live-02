import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "../screens/LoginScreen";
import Register from "../screens/RegisterScreen";
import PatientTabs from "./PatientTabs";
import SplashScreen from "../screens/SplashScreen";
import BookAppointment from "../screens/BookAppointmentScreen";
import AppointmentDetail from "../screens/AppointmentDetailScreen";
import EditAppointment from "../screens/EditAppointmentScreen";
import EditProfile from "../screens/EditProfileScreen";
import { RootStackParamList } from "../types/navigation";
import CreatePasswordScreen from "../screens/CreatePasswordScreen";
import PrescriptionDetailsScreen from "../screens/PrescriptionDetailsScreen";
type AppNavigatorParamList = RootStackParamList & {
  CreatePassword: undefined;
};

const Stack = createNativeStackNavigator<AppNavigatorParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />

      <Stack.Screen name="Login" component={Login} />

      <Stack.Screen name="Register" component={Register} />

      <Stack.Screen name="PatientTabs" component={PatientTabs} />

      <Stack.Screen name="BookAppointment" component={BookAppointment} />

      <Stack.Screen name="AppointmentDetail" component={AppointmentDetail} />
      <Stack.Screen
        name="PrescriptionDetails"
        component={PrescriptionDetailsScreen}
      />
      <Stack.Screen name="EditAppointment" component={EditAppointment} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="CreatePassword" component={CreatePasswordScreen} />
    </Stack.Navigator>
  );
}

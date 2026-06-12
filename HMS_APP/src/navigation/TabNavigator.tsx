import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/home";
import { Ionicons } from "@expo/vector-icons";
import ProfileScreen from "../screens/profile";
import AppointmentScreen from "../screens/appointment";

const Tab = createBottomTabNavigator();

const TabIcon = ({ focused, color, size, active, inactive }: any) => (
  <Ionicons name={focused ? active : inactive} color={color} size={size} />
);

const HomeTabIcon = ({
  focused,
  color,
  size,
}: {
  focused: boolean;
  color: string;
  size: number;
}) => (
  <TabIcon
    focused={focused}
    color={color}
    size={size}
    active="home"
    inactive="home-outline"
  />
);

const ProfileTabIcon = ({
  focused,
  color,
  size,
}: {
  focused: boolean;
  color: string;
  size: number;
}) => (
  <TabIcon
    focused={focused}
    color={color}
    size={size}
    active="person"
    inactive="person-outline"
  />
);

const AppointmentTabIcon = ({
  focused,
  color,
  size,
}: {
  focused: boolean;
  color: string;
  size: number;
}) => (
  <TabIcon
    focused={focused}
    color={color}
    size={size}
    active="calendar"
    inactive="calendar-outline"
  />
);

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "rgb(84, 20, 134)",
        tabBarInactiveTintColor: "rgb(91, 91, 91)",
        tabBarStyle: {
          backgroundColor: "rgb(235, 235, 235)",
          height: 70,
          padding: 10,
        },
        tabBarLabelStyle: {
          fontFamily: "Sans",
          fontSize: 13,
        },
      }}
    >
      <Tab.Screen
        name="home"
        component={HomeScreen}
        options={{
          tabBarIcon: HomeTabIcon,
          tabBarLabel: "HOME",
        }}
      ></Tab.Screen>
      <Tab.Screen
        name="profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ProfileTabIcon,
          tabBarLabel: "PROFILE",
        }}
      ></Tab.Screen>
      <Tab.Screen
        name="appointment"
        component={AppointmentScreen}
        options={{
          tabBarIcon: AppointmentTabIcon,
          tabBarLabel: "APPOINTMENT",
        }}
      ></Tab.Screen>
    </Tab.Navigator>
  );
}

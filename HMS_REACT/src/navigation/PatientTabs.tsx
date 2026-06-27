import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import Dashboard from "../screens/DashboardScreen";
import Appointments from "../screens/AppointmentScreen";
import MedicalRecords from "../screens/MedicalRecordsScreen";
import Profile from "../screens/ProfileScren";

const Tab = createBottomTabNavigator();

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const getTabIconName = (
  routeName: string,
  focused: boolean
): IconName => {
  if (routeName === "Dashboard") {
    return focused ? "home" : "home-outline";
  }

  if (routeName === "Appointments") {
    return focused ? "calendar" : "calendar-outline";
  }

  if (routeName === "Records") {
    return focused ? "document-text" : "document-text-outline";
  }

  if (routeName === "Profile") {
    return focused ? "person" : "person-outline";
  }

  return "home";
};

type IconProps = {
  focused: boolean;
  color: string;
  size: number;
};

const dashboardIcon = ({ focused, color, size }: IconProps) => (
  <Ionicons
    name={getTabIconName("Dashboard", focused)}
    size={size}
    color={color}
  />
);

const appointmentsIcon = ({ focused, color, size }: IconProps) => (
  <Ionicons
    name={getTabIconName("Appointments", focused)}
    size={size}
    color={color}
  />
);

const recordsIcon = ({ focused, color, size }: IconProps) => (
  <Ionicons
    name={getTabIconName("Records", focused)}
    size={size}
    color={color}
  />
);

const profileIcon = ({ focused, color, size }: IconProps) => (
  <Ionicons
    name={getTabIconName("Profile", focused)}
    size={size}
    color={color}
  />
);

const screenOptions = {
  headerShown: false,
  tabBarHideOnKeyboard: true,
  tabBarShowLabel: true,
  tabBarActiveTintColor: "#2563EB",
  tabBarInactiveTintColor: "#94A3B8",

  tabBarStyle: {
    position: "absolute" as const,
    left: 18,
    right: 18,
    bottom: 18,
    height: 78,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderTopWidth: 0,
    elevation: 20,
    shadowColor: "#2563EB",
    shadowOpacity: 0.15,
    shadowRadius: 24,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    paddingTop: 8,
    paddingBottom: 8,
  },

  tabBarItemStyle: {
    borderRadius: 20,
    marginVertical: 8,
  },

  tabBarActiveBackgroundColor: "rgba(37,99,235,0.08)",

  tabBarLabelStyle: {
    fontSize: 11,
    fontWeight: "700" as const,
    marginBottom: 8,
  },
};

export default function PatientTabs() {
  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="Dashboard"
        component={Dashboard}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: dashboardIcon,
        }}
      />

      <Tab.Screen
        name="Appointments"
        component={Appointments}
        options={{
          tabBarLabel: "Appointments",
          tabBarIcon: appointmentsIcon,
        }}
      />

      <Tab.Screen
        name="Records"
        component={MedicalRecords}
        options={{
          tabBarLabel: "Records",
          tabBarIcon: recordsIcon,
        }}
      />

      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: profileIcon,
        }}
      />
    </Tab.Navigator>
  );
}
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import Dashboard from "../screens/DashboardScreen";

import Appointments from "../screens/AppointmentScreen";

import Profile from "../screens/ProfileScren";
import MedicalRecords from "../screens/MedicalRecordsScreen";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

type TabIconProps = {
  routeName: string;
  focused: boolean;
  color: string;
};

const getTabIconName = (
  routeName: string,
  focused: boolean,
): React.ComponentProps<typeof Ionicons>["name"] => {
  const icons: Record<
    string,
    {
      active: React.ComponentProps<typeof Ionicons>["name"];
      inactive: React.ComponentProps<typeof Ionicons>["name"];
    }
  > = {
    Dashboard: {
      active: "home",
      inactive: "home-outline",
    },
    Appointments: {
      active: "calendar",
      inactive: "calendar-outline",
    },
    Records: {
      active: "document-text",
      inactive: "document-text-outline",
    },
    Profile: {
      active: "person",
      inactive: "person-outline",
    },
  };

  const routeIcons = icons[routeName] || icons.Dashboard;

  return focused ? routeIcons.active : routeIcons.inactive;
};

const PatientTabIcon = ({ routeName, focused, color }: TabIconProps) => (
  <Ionicons name={getTabIconName(routeName, focused)} size={26} color={color} />
);

const getPatientTabScreenOptions = ({ route }: any): any => ({
  headerShown: false,
  tabBarHideOnKeyboard: true,

  tabBarShowLabel: true,

  tabBarActiveTintColor: "#2563EB",

  tabBarInactiveTintColor: "#94A3B8",
  tabBarStyle: {
    position: "absolute",

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

  tabBarLabelStyle: {
    tabBarItemStyle: {
      borderRadius: 20,
      marginVertical: 8,
    },
    tabBarActiveBackgroundColor: "rgba(37,99,235,0.08)",

    fontSize: 11,

    fontWeight: "700",

    marginBottom: 8,
  },

  tabBarIcon: ({ focused, color }: Omit<TabIconProps, "routeName">) => (
    <PatientTabIcon routeName={route.name} focused={focused} color={color} />
  ),
});

export default function PatientTabs() {
  return (
    <Tab.Navigator screenOptions={getPatientTabScreenOptions}>
      <Tab.Screen
        name="Dashboard"
        component={Dashboard}
        options={{
          tabBarLabel: "Home",
        }}
      />
      <Tab.Screen
        name="Appointments"
        component={Appointments}
        options={{
          tabBarLabel: "Appointments",
        }}
      />

      <Tab.Screen
        name="Records"
        component={MedicalRecords}
        options={{
          tabBarLabel: "Records",
        }}
      />

      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarLabel: "Profile",
        }}
      />
    </Tab.Navigator>
  );
}

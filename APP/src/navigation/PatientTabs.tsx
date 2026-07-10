import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Dashboard from "../screens/DashboardScreen";
import Appointments from "../screens/AppointmentScreen";
import Profile from "../screens/ProfileScreen";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import HealthRecordsScreen from "../screens/HealthRecordScreen";
const Tab = createBottomTabNavigator();

type TabIconProps = Readonly<{
  routeName: string;
  focused: boolean;
  color: string;
}>;

type TabBarIconProps = Readonly<{
  focused: boolean;
  color: string;
}>;

const getTabIconName = (
  routeName: string,
  focused: boolean,
): React.ComponentProps<typeof Ionicons>["name"] => {
  if (routeName === "Dashboard") {
    return focused ? "home" : "home-outline";
  }

  if (routeName === "Appointments") {
    return focused ? "calendar" : "calendar-outline";
  }

  if (routeName === "Profile") {
    return focused ? "person" : "person-outline";
  }

  if (routeName === "HealthRecords") {
    return focused ? "medical" : "medical-outline";
  }

  return "home";
};

function PatientTabIcon({ routeName, focused, color }: TabIconProps) {
  return (
    <Ionicons
      name={getTabIconName(routeName, focused)}
      size={26}
      color={color}
    />
  );
}

const createTabBarIcon = (routeName: string) => {
  function TabBarIconRenderer({ focused, color }: TabBarIconProps) {
    return (
    <PatientTabIcon routeName={routeName} focused={focused} color={color} />
    );
  }

  TabBarIconRenderer.displayName = `${routeName}TabBarIcon`;

  return TabBarIconRenderer;
};

const dashboardOptions = {
  tabBarLabel: "Home",
  tabBarIcon: createTabBarIcon("Dashboard"),
};

const appointmentOptions = {
  tabBarLabel: "Appointments",
  tabBarIcon: createTabBarIcon("Appointments"),
};

const healthRecordOptions = {
  tabBarLabel: "Records",
  tabBarIcon: createTabBarIcon("HealthRecords"),
};

const profileOptions = {
  tabBarLabel: "Profile",
  tabBarIcon: createTabBarIcon("Profile"),
};

export default function PatientTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
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
        tabBarItemStyle: {
          borderRadius: 20,
          marginVertical: 8,
        },
        tabBarActiveBackgroundColor: "rgba(37,99,235,0.08)",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginBottom: 8,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={Dashboard}
        options={dashboardOptions}
      />
      <Tab.Screen
        name="Appointments"
        component={Appointments}
        options={appointmentOptions}
      />
      <Tab.Screen
        name="HealthRecords"
        component={HealthRecordsScreen}
        options={healthRecordOptions}
      />

      <Tab.Screen
        name="Profile"
        component={Profile}
        options={profileOptions}
      />
    </Tab.Navigator>
  );
}

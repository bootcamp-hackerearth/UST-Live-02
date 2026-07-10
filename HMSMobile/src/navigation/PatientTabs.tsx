import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Dashboard from "../screens/DashboardScreen";
import Appointments from "../screens/AppointmentScreen";
import Profile from "../screens/ProfileScreen";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import HealthRecordsScreen from "../screens/HealthRecordScreen";

const Tab = createBottomTabNavigator();

interface TabBarIconProps {
  readonly focused: boolean;
  readonly color: string;
  readonly size: number;
  readonly routeName: string;
}

const TabBarIcon: React.FC<TabBarIconProps> = ({
  focused,
  color,
  size,
  routeName,
}) => {
  let iconName: React.ComponentProps<typeof Ionicons>["name"] = "home";

  switch (routeName) {
    case "Dashboard":
      iconName = focused ? "home" : "home-outline";
      break;
    case "Appointments":
      iconName = focused ? "calendar" : "calendar-outline";
      break;
    case "HealthRecords":
      iconName = focused ? "medical" : "medical-outline";
      break;
    case "Profile":
      iconName = focused ? "person" : "person-outline";
      break;
  }

  return <Ionicons name={iconName} size={size} color={color} />;
};

type TabBarIconRendererProps = {
  readonly focused: boolean;
  readonly color: string;
};

function DashboardIcon({ focused, color }: TabBarIconRendererProps) {
  return (
    <TabBarIcon
      focused={focused}
      color={color}
      size={26}
      routeName="Dashboard"
    />
  );
}

function AppointmentsIcon({ focused, color }: TabBarIconRendererProps) {
  return (
    <TabBarIcon
      focused={focused}
      color={color}
      size={26}
      routeName="Appointments"
    />
  );
}

function HealthRecordsIcon({ focused, color }: TabBarIconRendererProps) {
  return (
    <TabBarIcon
      focused={focused}
      color={color}
      size={26}
      routeName="HealthRecords"
    />
  );
}

function ProfileIcon({ focused, color }: TabBarIconRendererProps) {
  return (
    <TabBarIcon
      focused={focused}
      color={color}
      size={26}
      routeName="Profile"
    />
  );
}

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
          tabBarIcon: DashboardIcon,
        }}
      />
      <Tab.Screen
        name="Appointments"
        component={Appointments}
        options={{
          tabBarLabel: "Appointments",
          tabBarIcon: AppointmentsIcon,
        }}
      />
      <Tab.Screen
        name="HealthRecords"
        component={HealthRecordsScreen}
        options={{
          tabBarLabel: "Records",
          tabBarIcon: HealthRecordsIcon,
        }}
      />

      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ProfileIcon,
        }}
      />
    </Tab.Navigator>
  );
}

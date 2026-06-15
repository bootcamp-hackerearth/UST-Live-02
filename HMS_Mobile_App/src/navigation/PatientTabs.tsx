import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Dashboard from "../screens/DashboardScreen";
import Appointments from "../screens/AppointmentScreen";
import Profile from "../screens/ProfileScren";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();


const ROUTE_ICONS: Record<
  string,
  { focused: typeof Ionicons.defaultProps; default: typeof Ionicons.defaultProps }
> = {
  Dashboard:    { focused: "home",     default: "home-outline" },
  Appointments: { focused: "calendar", default: "calendar-outline" },
  Profile:      { focused: "person",   default: "person-outline" },
};


interface TabBarIconProps {
 readonly routeName: string;
readonly  focused: boolean;
 readonly color: string;
}

function TabBarIcon({ routeName, focused, color }: TabBarIconProps) {
  const icons = ROUTE_ICONS[routeName];

  let iconName: React.ComponentProps<typeof Ionicons>["name"] = "home";
  if (icons) {
    iconName = focused ? icons.focused : icons.default;
  }

  return <Ionicons name={iconName} size={26} color={color} />;
}

const TAB_BAR_STYLE = {
  position:        "absolute" as const,
  left:            18,
  right:           18,
  bottom:          18,
  height:          78,
  borderRadius:    28,
  backgroundColor: "rgba(255,255,255,0.92)",
  borderTopWidth:  0,
  elevation:       20,
  shadowColor:     "#2563EB",
  shadowOpacity:   0.15,
  shadowRadius:    24,
  shadowOffset:    { width: 0, height: 12 },
  paddingTop:      8,
  paddingBottom:   8,
} as const;

const TAB_BAR_LABEL_STYLE = {
  fontSize:     11,
  fontWeight:   "700" as const,
  marginBottom: 8,
} as const;
 
function screenOptions({ route }: { route: { name: string } }) {
  return {
    headerShown:          false,
    tabBarHideOnKeyboard: true,
    tabBarShowLabel:      true,
    tabBarActiveTintColor:   "#2563EB",
    tabBarInactiveTintColor: "#94A3B8",
    tabBarStyle:      TAB_BAR_STYLE,
    tabBarLabelStyle: TAB_BAR_LABEL_STYLE,
    tabBarIcon: ({ focused, color }: { focused: boolean; color: string }) => (
      <TabBarIcon routeName={route.name} focused={focused} color={color} />
    ),
  };
}

export default function PatientTabs() {
  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen name="Dashboard"    component={Dashboard}    options={{ tabBarLabel: "Home" }} />
      <Tab.Screen name="Appointments" component={Appointments} options={{ tabBarLabel: "Appointments" }} />
      <Tab.Screen name="Profile"      component={Profile}      options={{ tabBarLabel: "Profile" }} />
    </Tab.Navigator>
  );
}
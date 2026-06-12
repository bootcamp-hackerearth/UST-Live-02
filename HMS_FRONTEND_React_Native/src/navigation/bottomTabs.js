import React from "react";
import PropTypes from "prop-types";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../screens/homeScreen";
import AppointmentScreen from "../screens/appointmentScreen";
import ProfileScreen from "../screens/profileScreen";

const Tab = createBottomTabNavigator();

const HomeIcon = ({ focused, color, size }) => (
  <Ionicons
    name={focused ? "home" : "home-outline"}
    size={size}
    color={color}
  />
);

const AppointmentIcon = ({ focused, color, size }) => (
  <Ionicons
    name={focused ? "calendar" : "calendar-outline"}
    size={size}
    color={color}
  />
);

const ProfileIcon = ({ focused, color, size }) => (
  <Ionicons
    name={focused ? "person" : "person-outline"}
    size={size}
    color={color}
  />
);

HomeIcon.propTypes = {
  focused: PropTypes.bool.isRequired,
  color: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
};

AppointmentIcon.propTypes = {
  focused: PropTypes.bool.isRequired,
  color: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
};

ProfileIcon.propTypes = {
  focused: PropTypes.bool.isRequired,
  color: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
};

const BottomTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#6B46C1",
        tabBarInactiveTintColor: "#999",
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: HomeIcon,
        }}
      />

      <Tab.Screen
        name="Appointments"
        component={AppointmentScreen}
        options={{
          tabBarIcon: AppointmentIcon,
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ProfileIcon,
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabs;

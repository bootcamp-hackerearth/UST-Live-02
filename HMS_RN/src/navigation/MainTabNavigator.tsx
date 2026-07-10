/**
 * @file MainTabNavigator.tsx
 * @overview Sets up the main bottom tab navigation for the application.
 * @description This file defines the primary navigation structure after a user logs in. It creates a `Tab.Navigator`
 * with four main tabs: Home, Appointments, Records, and Profile. The 'Appointments' tab contains its own nested `StackNavigator`
 * to handle the flow between viewing, booking, and editing appointments.
 * @routes
 * - `HomeTab`: Navigates to `HomeScreen`.
 * - `AppointmentsTab`: Navigates to the `AppointmentNavigator` stack.
 *   - `ViewAppointments`: `ViewAppointmentsScreen`
 *   - `BookAppointment`: `BookAppointmentScreen`
 *   - `EditAppointment`: `EditAppointmentScreen`
 * - `RecordsTab`: Navigates to `MedicalRecordsScreen`.
 * - `ProfileTab`: Navigates to `ProfileScreen`.
 * - MAINTABNAVIGATOR.TSX -> HomeScreen.tsx, ViewAppointmentsScreen.tsx, BookAppointmentScreen.tsx, EditAppointmentScreens.tsx, MedicalRecordsScreen.tsx, ProfileScreen.tsx
 */

import React, { useEffect, useRef } from "react";
import { Animated, View, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import BookAppointmentScreen from "../screens/BookAppointmentScreen";
import ViewAppointmentsScreen from "../screens/ViewAppointmentsScreen";
import EditAppointmentScreen from "../screens/EditAppointmentScreens";
import MedicalRecordsScreen from "../screens/MedicalRecordsScreen";

import { AppointmentStackParamList } from "../types/navigation";

const Tab = createBottomTabNavigator();
const AppointmentStack =
  createNativeStackNavigator<AppointmentStackParamList>();

function AppointmentNavigator() {
  return (
    <AppointmentStack.Navigator screenOptions={{ headerShown: false }}>
      <AppointmentStack.Screen
        name="ViewAppointments"
        component={ViewAppointmentsScreen}
      />
      <AppointmentStack.Screen
        name="BookAppointment"
        component={BookAppointmentScreen}
      />
      <AppointmentStack.Screen
        name="EditAppointment"
        component={EditAppointmentScreen}
      />
    </AppointmentStack.Navigator>
  );
}

const AnimatedTabIcon = ({
  focused,
  iconName,
}: {
  focused: boolean;
  iconName: keyof typeof Feather.glyphMap;
}) => {
  const scaleValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (focused) {
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 5,
        tension: 50,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(scaleValue, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [focused]);

  return (
    <View style={styles.iconContainer}>
      <Animated.View
        style={[
          styles.circleBackground,
          {
            transform: [{ scale: scaleValue }],
            opacity: scaleValue,
          },
        ]}
      />
      <Feather
        name={iconName}
        size={24}
        color={focused ? "#6C4EDB" : "#9CA3AF"}
        style={{ zIndex: 1 }}
      />
    </View>
  );
};

const HomeIcon = ({ focused }: { focused: boolean }) => (
  <AnimatedTabIcon focused={focused} iconName="home" />
);

const CalendarIcon = ({ focused }: { focused: boolean }) => (
  <AnimatedTabIcon focused={focused} iconName="calendar" />
);

const RecordsIcon = ({ focused }: { focused: boolean }) => (
  <AnimatedTabIcon focused={focused} iconName="file-text" />
);

const UserIcon = ({ focused }: { focused: boolean }) => (
  <AnimatedTabIcon focused={focused} iconName="user" />
);

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 10,
          height: 90,
          backgroundColor: "#FFFFFF",
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: -5 },
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarIcon: HomeIcon,
        }}
      />

      <Tab.Screen
        name="AppointmentsTab"
        component={AppointmentNavigator}
        options={{
          tabBarIcon: CalendarIcon,
        }}
      />

      <Tab.Screen
        name="RecordsTab"
        component={MedicalRecordsScreen}
        options={{
          tabBarIcon: RecordsIcon,
        }}
      />

      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarIcon: UserIcon,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: 60,
  },
  circleBackground: {
    position: "absolute",
    width: 100,
    height: 35,
    backgroundColor: "rgba(108, 78, 219, 0.15)",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
  },
});

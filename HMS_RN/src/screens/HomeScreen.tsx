import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import * as SecureStore from "expo-secure-store";
import Toast from "react-native-toast-message";
import { PatientProfile } from "../features/auth/types";
import AppointmentCard, { Appointment } from "../components/AppointmentCard";
import TopDoctors, { Doctor } from "../components/TopDoctors";
import HealthSummaryCard from "../components/HealthSummaryCard";
import { appointmentService } from "../services/appointmentService";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen() {
  const backgroundImage = require("../../assets/images/hospital3.jpg");
  const navigation = useNavigation<BottomTabNavigationProp<any>>();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [profile, setProfile] = useState<PatientProfile | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, []),
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener("tabPress", () => {
      if (navigation.isFocused()) {
        setRefreshing(true);
        fetchDashboardData();
      }
    });

    return unsubscribe;
  }, [navigation]);

  const fetchDashboardData = async () => {
    try {
      const token = await SecureStore.getItemAsync("patient_jwt");
      const profileString = await SecureStore.getItemAsync("patient_profile");

      if (!token || !profileString) {
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        return;
      }

      setProfile(JSON.parse(profileString));

      const [appointmentsData, doctorsData] = await Promise.all([
        appointmentService.getMyAppointments(),
        appointmentService.getDoctors(),
      ]);

      setAppointments(appointmentsData);
      setDoctors(doctorsData);
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not load dashboard data. Please try again.",
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, []);

  const getNextAppointment = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const todayStr = `${year}-${month}-${day}`;

    return appointments.find((app) => {
      const appDateStr = app.date.split("T")[0];
      return (
        appDateStr >= todayStr &&
        (app.status === "Scheduled" || app.status === "Pending")
      );
    });
  };

  const nextAppointment = getNextAppointment();

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.backgroundImage}
      imageStyle={{ opacity: 0.3 }}
    >
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        {isLoading ? (
          <View style={[styles.container, styles.center]}>
            <ActivityIndicator size="large" color="#6C4EDB" />
            <Text style={styles.loadingText}>Loading your dashboard...</Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#4B1D76"]}
                tintColor="#4B1D76"
              />
            }
          >
            <View style={styles.header}>
              <View>
                <Text style={styles.patientName}>{profile?.name}</Text>
                <Text style={styles.uhid}>{profile?.UHID}</Text>
              </View>
            </View>

            <HealthSummaryCard profile={profile} />

            <View style={styles.sectionHeader}>
              <Ionicons name="calendar-clear-outline" size={20} color="blue" />
              <Text style={styles.sectionTitle}>My Appointments</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() =>
                navigation.navigate("AppointmentsTab", {
                  screen: "ViewAppointments",
                })
              }
            >
              {nextAppointment ? (
                <AppointmentCard appointment={nextAppointment} />
              ) : (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>
                    No upcoming appointments. Tap to schedule.
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TopDoctors doctors={doctors} />
          </ScrollView>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  backgroundImage: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#6B7280",
    marginTop: 12,
    fontSize: 16,
    fontFamily: "Lexend",
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  welcomeText: {
    color: "#9CA3AF",
    fontSize: 16,
    fontFamily: "Lexend",
  },
  patientName: {
    color: "#1E1E3F",
    fontSize: 55,
    fontFamily: "ShareTech",
    marginTop: 4,
  },
  uhid: {
    color: "#2d0ba9",
    fontSize: 14,
    fontFamily: "Lexend",
    marginTop: 4,
  },
  settingsButton: {
    backgroundColor: "#E5E7EB",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  settingsText: {
    fontSize: 20,
  },
  sectionHeader: {
    backgroundColor: "#e6e6fb",
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
    paddingHorizontal: 20,
    flexDirection: "row",
    gap: 8,
  },
  sectionTitle: {
    color: "#1E1E3F",
    fontSize: 20,
    fontFamily: "Lexend",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  emptyText: {
    color: "#9CA3AF",
    fontStyle: "italic",
    fontFamily: "Lexend",
  },
});

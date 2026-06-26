import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  ListRenderItem,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import * as SecureStore from "expo-secure-store";
import Toast from "react-native-toast-message";
import { PatientProfile } from "../features/auth/types";
import AppointmentCard, { Appointment } from "../components/AppointmentCard";
import { Doctor } from "../components/DoctorCarousel";
import HealthSummaryCard from "../components/HealthSummaryCard";
import { appointmentService } from "../services/appointmentService";
import { Ionicons } from "@expo/vector-icons";
import SearchBar from "../components/SearchBar";


const EMPTY_ARRAY: Doctor[] = [];

export default function HomeScreen() {
  const backgroundImage = require("../../assets/images/hospital3.jpg");
  const navigation = useNavigation<BottomTabNavigationProp<any>>();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");

  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1000); // 300ms delay

    // Cleanup function to clear the timeout if the user types again
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const fetchDashboardData = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync("patient_jwt");
      const profileString = await SecureStore.getItemAsync("patient_profile");

      if (!token || !profileString) {
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        return;
      }

      const [appointmentsData, doctorsData] = await Promise.all([
        appointmentService.getMyAppointments(),
        appointmentService.getDoctors(),
      ]);

      if (isMounted.current) {
        setProfile(JSON.parse(profileString));
        setAppointments(appointmentsData);
        setDoctors(doctorsData);
      }
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not load dashboard data. Please try again.",
      });
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        setRefreshing(false);
      }
    }
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [fetchDashboardData]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  const nextAppointment = useMemo(() => {
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
  }, [appointments]);

  const specialties = useMemo(() => {
    const specs = new Set<string>();
    doctors.forEach((d) => {
      if (d.specialization) specs.add(d.specialization);
      else if (d.department) specs.add(d.department);
      else specs.add("General");
    });
    return Array.from(specs);
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return EMPTY_ARRAY;
    const query = debouncedSearchTerm.toLowerCase();
    return doctors.filter(
      (d) =>
        d.name.toLowerCase().includes(query) ||
        d.specialization?.toLowerCase().includes(query) ||
        d.designation?.toLowerCase().includes(query),
    );
  }, [doctors, debouncedSearchTerm]);

  const navigateToBookDoctor = useCallback(
    (doctorEmployeeCode: string) => {
      navigation.navigate("AppointmentsTab", {
        screen: "BookAppointment",
        params: { preselectedDoctorId: doctorEmployeeCode },
      });
    },
    [navigation],
  );

  const navigateToViewAppointments = useCallback(() => {
    navigation.navigate("AppointmentsTab", {
      screen: "ViewAppointments",
    });
  }, [navigation]);

  const renderDoctorResult = useCallback<ListRenderItem<Doctor>>(
    ({ item: doctor }) => (
      <View style={{ paddingHorizontal: 20 }}>
        <TouchableOpacity
          style={styles.doctorResultCard}
          onPress={() => navigateToBookDoctor(doctor.employeeCode)}
        >
          <View>
            <Text style={styles.resultName}>{doctor.name}</Text>
            <Text style={styles.resultSpec}>
              {doctor.specialization || doctor.department || "General"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
        
      </View>
    ),
    [navigateToBookDoctor],
  );

  const keyExtractor = useCallback(
    (item: Doctor) => item._id || item.employeeCode,
    [],
  );

  const renderListHeader = useCallback(
    () => (
      <>
        <View style={styles.header}>
          <View>
            <Text style={styles.patientName}>{profile?.name}</Text>
            <Text style={styles.uhid}>{profile?.UHID}</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Ionicons name="calendar-clear-outline" size={20} color="blue" />
          <Text style={styles.sectionTitle}>Upcoming Appointment</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={navigateToViewAppointments}
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

        <View style={[styles.sectionHeader, { marginBottom: 12 }]}>
          <Ionicons name="search-outline" size={20} color="blue" />
          <Text style={styles.sectionTitle}>Find a Doctor</Text>
        </View>

        <View style={styles.searchContainer}>
          <SearchBar
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Search by name, specialty, or designation"
            
          />
        </View>

        {searchTerm.trim() ? (
          <View style={styles.searchResultsContainer}>
            <Text style={styles.subHeading}>Search Results</Text>
            {filteredDoctors.length === 0 && (
              <Text style={styles.noResultsText}>
                No doctors found matching your search.
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.specialtiesContainer}>
            <Text style={styles.subHeading}>Specialties</Text>
            <View style={styles.specialtiesGrid}>
              {specialties.map((spec) => (
                <TouchableOpacity
                  key={spec}
                  style={styles.specialtyPill}
                  onPress={() => setSearchTerm(spec)}
                >
                  <Text style={styles.specialtyText}>{spec}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        
      </>
    ),
    [
      profile,
      nextAppointment,
      searchTerm,
      specialties,
      filteredDoctors.length,
      navigateToViewAppointments,
      profile, nextAppointment, specialties, navigateToViewAppointments
    ],
  );

  const renderListFooter = useCallback(() => {
    return <HealthSummaryCard profile={profile} />;
  }, [profile]);

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
          <FlatList
            data={debouncedSearchTerm.trim() ? filteredDoctors : EMPTY_ARRAY} 
            keyExtractor={keyExtractor} 
            renderItem={renderDoctorResult}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={11}
            removeClippedSubviews={true}
            ListFooterComponent={renderListFooter} 
            ListHeaderComponent={renderListHeader()}
            keyboardShouldPersistTaps="handled"
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
          />
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
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  specialtiesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  subHeading: {
    fontSize: 16,
    fontFamily: "Lexend",
    color: "#4B5563",
    marginBottom: 12,
    borderRadius: 20,
    backgroundColor: "#e6e6fb",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  specialtiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  specialtyPill: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  specialtyText: { color: "#4B1D76", fontFamily: "Lexend", fontSize: 14 },
  searchResultsContainer: { paddingHorizontal: 20, marginBottom: 20 },
  doctorResultCard: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  resultName: {
    fontSize: 16,
    fontFamily: "Lexend",
    color: "#1E1E3F",
    marginBottom: 4,
  },
  resultSpec: { fontSize: 13, fontFamily: "Lexend", color: "#6B7280" },
  noResultsText: {
    color: "#9CA3AF",
    fontFamily: "Lexend",
    fontStyle: "italic",
  },
  healthSummaryContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
});

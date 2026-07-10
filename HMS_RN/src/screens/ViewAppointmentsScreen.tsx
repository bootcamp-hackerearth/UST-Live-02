/**
 * @file ViewAppointmentsScreen.tsx
 * @overview Screen for viewing and managing all of a patient's appointments.
 * @description This screen fetches and displays a list of the user's past and upcoming appointments.
 * Each appointment is rendered in a `ManageAppointmentCard`, which provides options to edit or cancel.
 * It also includes a button to navigate to the booking screen for a new appointment.
 * @routes
 * - This is the initial screen in the `AppointmentNavigator` stack.
 * - Navigates to `EditAppointment` or `BookAppointment`.
 * @connections
 * - On focus (`useFocusEffect`) -> `fetchAppointments()` -> `appointmentService.getMyAppointments()` -> Populates `appointments` state.
 * - Renders a `ManageAppointmentCard` for each appointment, passing `handleEdit` and `handleDelete` as callbacks.
 * - `handleDelete` -> `Alert` confirmation -> `executeCancellation()` -> `appointmentService.updateAppointment({ status: "Cancelled" })`.
 * - `handleEdit` -> `navigation.navigate("EditAppointment", ...)` -> Navigates to the edit screen with appointment data.
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ImageBackground,
  TouchableOpacity,
  Alert,
  ListRenderItem,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useNavigation,
  NavigationProp,
  useFocusEffect,
} from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { appointmentService } from "../services/appointmentService";
import ManageAppointmentCard from "../components/ManageAppointmentCard";

interface Appointment {
  _id: string;
  appointmentCode: string;
  doctorEmployeeID: string;
  date: string;
  timeSlot: string;
  doctorName: string;
  doctorSpecialization?: string;
  doctorDept?: string;
  status: "Scheduled" | "Pending";
}

export default function ViewAppointmentsScreen() {
  const backgroundImage = require("../../assets/images/hospital3.jpg");
  const navigation = useNavigation<NavigationProp<any>>();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchAppointments = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setIsLoading(true);
    try {
      const data = await appointmentService.getMyAppointments();
      if (isMounted.current) setAppointments(data);
    } catch (err) {
      console.error("Fetch Appointments Failed:", err);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAppointments(true);
  }, [fetchAppointments]);

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [fetchAppointments]),
  );

  const handleEdit = useCallback(
    (appointment: Appointment) => {
      navigation.navigate("EditAppointment", {
        appointmentData: {
          appointmentCode: appointment.appointmentCode,
          doctorEmployeeID: appointment.doctorEmployeeID,
          date: appointment.date,
          timeSlot: appointment.timeSlot,
        },
      });
    },
    [navigation],
  );

  const executeCancellation = useCallback(
    async (appointment: Appointment) => {
      try {
        const payload = { status: "Cancelled" };
        await appointmentService.updateAppointment(
          appointment.appointmentCode,
          payload,
        );
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Appointment cancelled successfully.",
        });
        fetchAppointments();
      } catch (err: any) {
        console.error("Delete Appointment Failed:", err);
        Toast.show({
          type: "error",
          text1: "Cancellation Failed",
          text2:
            err.response?.data?.message ||
            "Could not connect to the server to cancel the appointment.",
        });
      }
    },
    [fetchAppointments],
  );

  const handleDelete = useCallback(
    (appointment: Appointment) => {
      const onConfirmDelete = () => executeCancellation(appointment);

      Alert.alert(
        "Cancel Appointment",
        `Are you sure you want to cancel your appointment with ${appointment.doctorName}?`,
        [
          { text: "No, keep it", style: "cancel" },
          {
            text: "Yes, Cancel",
            style: "destructive",
            onPress: () => {
              void onConfirmDelete();
            },
          },
        ],
      );
    },
    [executeCancellation],
  );

  const navigateToBookAppointment = useCallback(
    () => navigation.navigate("BookAppointment"),
    [navigation],
  );

  const renderAppointmentItem = useCallback<ListRenderItem<Appointment>>(
    ({ item }) => (
      <ManageAppointmentCard
        appointment={item}
        onEdit={() => handleEdit(item)}
        onDelete={() => handleDelete(item)}
      />
    ),
    [handleEdit, handleDelete],
  );

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.backgroundImage}
      imageStyle={{ opacity: 0.3 }}
    >
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <View style={styles.container}>
          <Text style={styles.mainTitle}>View your</Text>
          <Text style={styles.boldTitle}>APPOINTMENTS</Text>

          <TouchableOpacity
            style={styles.bookTriggerBtn}
            onPress={navigateToBookAppointment}
          >
            <Text style={styles.bookTriggerText}>Book New Appointment</Text>
          </TouchableOpacity>

          {isLoading ? (
            <ActivityIndicator size="large" color="#4B1D76" />
          ) : (
            <FlatList
              data={appointments}
              keyExtractor={(item) => item.appointmentCode || item._id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              renderItem={renderAppointmentItem}
              ListEmptyComponent={
                <View style={styles.emptyListCard}>
                  <Text style={styles.emptyListText}>
                    No appointment logs found.
                  </Text>
                </View>
              }
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={["#4B1D76"]}
                  tintColor="#4B1D76"
                />
              }
              initialNumToRender={8}
              maxToRenderPerBatch={8}
              windowSize={11}
              removeClippedSubviews={true}
            />
          )}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    backgroundColor: "#E6F0F2",
  },
  bg: { flex: 1, backgroundColor: "#E6F0F2" },
  safe: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  listContent: {
    paddingBottom: 24,
  },
  mainTitle: {
    fontSize: 36,
    fontFamily: "Montserrat",
    fontWeight: "300",
    color: "#1E1E3F",
  },
  boldTitle: {
    fontSize: 36,
    fontFamily: "Lexend",
    color: "#6C4EDB",
    marginBottom: 16,
  },
  bookTriggerBtn: {
    backgroundColor: "#6C4EDB",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#6C4EDB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  bookTriggerText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Lexend",
  },
  backBtn: {
    backgroundColor: "#E5E7EB",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  backText: { color: "#1E1E3F", fontWeight: "bold", fontSize: 13 },
  emptyListCard: {
    padding: 40,
    alignItems: "center",
  },
  emptyListText: {
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  goBackButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});

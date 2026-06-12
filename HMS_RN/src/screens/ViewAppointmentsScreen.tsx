import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ImageBackground,
  TouchableOpacity,
  Alert,
} from "react-native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useNavigation,
  NavigationProp,
  useFocusEffect,
} from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { appointmentService } from "../services/appointmentService";
import ManageAppointmentCard from "../components/ManageAppointmentCard";

export default function ViewAppointmentsScreen() {
  const backgroundImage = require("../../assets/images/hospital3.jpg");
  const navigation = useNavigation<NavigationProp<any>>();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, []),
  );

  useEffect(() => {
    const parentNav = navigation.getParent<BottomTabNavigationProp<any>>();

    if (!parentNav) return;

    const unsubscribe = parentNav.addListener("tabPress", () => {
      if (navigation.isFocused()) {
        fetchAppointments();
      }
    });

    return unsubscribe;
  }, [navigation]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const data = await appointmentService.getMyAppointments();
      setAppointments(data);
    } catch (err) {
      console.error("Fetch Appointments Failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (appointment: any) => {
    navigation.navigate("EditAppointment", {
      appointmentData: {
        appointmentCode: appointment.appointmentCode,
        doctorEmployeeID: appointment.doctorEmployeeID,
        date: appointment.date,
        timeSlot: appointment.timeSlot,
      },
    });
  };

  const executeDeletion = async (appointment: any) => {
    try {
      await appointmentService.deleteAppointment(appointment.appointmentCode);
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
  };

  const handleDelete = (appointment: any) => {
    Alert.alert(
      "Cancel Appointment",
      `Are you sure you want to cancel your appointment with ${appointment.doctorName}?`,
      [
        { text: "No, keep it", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => {
            executeDeletion(appointment);
          },
        },
      ],
    );
  };

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
            onPress={() => navigation.navigate("BookAppointment")}
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
              renderItem={({ item }) => (
                <ManageAppointmentCard
                  appointment={item}
                  onEdit={() => handleEdit(item)}
                  onDelete={() => handleDelete(item)}
                />
              )}
              ListEmptyComponent={
                <View style={styles.emptyListCard}>
                  <Text style={styles.emptyListText}>
                    No appointment logs found.
                  </Text>
                </View>
              }
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
  mainTitle: { fontSize: 36, fontWeight: "300", color: "#1E1E3F" },
  boldTitle: {
    fontSize: 36,
    fontFamily: "Lexend",
    color: "#4B1D76",
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

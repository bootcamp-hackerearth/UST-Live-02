import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useCallback, useEffect, useState } from "react";

import { useRoute, useNavigation } from "@react-navigation/native";

import {
  getAppointmentById,
  cancelAppointment,
} from "../../src/services/appointment.service";
import { getApiErrorMessage } from "../../src/utils/api-error";

import GlassCard from "../../src/components/cards/GlassCard";
import StatusBadge from "../../src/components/badges/StatusBadge";
import InfoRow from "../../src/components/cards/InfoRow";

export default function AppointmentDetails() {
  const navigation = useNavigation<any>();

  const route = useRoute<any>();

  const { id } = route.params;
  const [appointment, setAppointment] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const isCancelled = appointment?.status === "CANCELLED";

  const loadAppointment = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getAppointmentById(id as string);

      setAppointment(response.data.data);
    } catch (error) {
      Alert.alert(
        "Error",
        getApiErrorMessage(error, "Failed to load appointment"),
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAppointment();
  }, [loadAppointment]);
  const handleCancel = async () => {
    try {
      await cancelAppointment(id as string);

      Alert.alert("Success", "Appointment cancelled", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert(
        "Error",
        getApiErrorMessage(error, "Failed to cancel appointment"),
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!appointment) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Appointment not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
      >
        <Text style={styles.title}>Appointment Details</Text>

        <View style={styles.badgeContainer}>
          <StatusBadge status={appointment.status} />
        </View>

        <GlassCard>
          <View style={styles.doctorAvatar}>
            <Text style={styles.avatarText}>
              {appointment?.doctorEmployeeId?.name?.charAt(0)}
            </Text>
          </View>

          <Text style={styles.doctorName}>
            Dr. {appointment?.doctorEmployeeId?.name}
          </Text>

          <Text
            style={{
              textAlign: "center",
              color: "#64748B",
              marginTop: 6,
            }}
          >
            Healthcare Specialist
          </Text>

          <View
            style={{
              marginTop: 14,
              alignSelf: "center",
              backgroundColor: "#DBEAFE",
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 999,
            }}
          >
            <Text
              style={{
                color: "#2563EB",
                fontWeight: "700",
              }}
            >
              {isCancelled ? "Appointment Cancelled" : "Consultation Scheduled"}
            </Text>
          </View>
        </GlassCard>

        {isCancelled && (
          <GlassCard>
            <Text style={styles.cancelledTitle}>Appointment Cancelled</Text>
            <Text style={styles.cancelledText}>
              This appointment has been cancelled. Please book another
              appointment with an available doctor.
            </Text>
          </GlassCard>
        )}

        <GlassCard>
          <Text style={styles.sectionTitle}>Appointment Information</Text>

          <InfoRow
            label="Appointment Date"
            value={appointment?.appointmentDate?.split("T")[0]}
          />

          <InfoRow label="Time Slot" value={appointment?.timeSlot} />

          <InfoRow label="Current Status" value={appointment?.status} />

          <InfoRow label="Appointment ID" value={appointment?._id?.slice(-8)} />
        </GlassCard>

        {appointment?.symptoms?.length > 0 && (
          <GlassCard>
            <Text style={styles.sectionTitle}>Symptoms</Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              {appointment?.symptoms?.map((symptom: string) => (
                <View
                  key={symptom}
                  style={{
                    backgroundColor: "#DBEAFE",
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 20,
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      color: "#2563EB",
                      fontWeight: "600",
                    }}
                  >
                    {symptom}
                  </Text>
                </View>
              ))}
            </View>
            <Text style={styles.symptoms}>
              {appointment?.symptoms?.join(", ")}
            </Text>
          </GlassCard>
        )}

        {appointment?.status === "PENDING" && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              navigation.navigate("EditAppointment", {
                id: appointment._id,
              })
            }
          >
            <Text style={styles.buttonText}>Edit Appointment</Text>
          </TouchableOpacity>
        )}

        {(appointment?.status === "PENDING" ||
          appointment?.status === "BOOKED") && (
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.buttonText}>Cancel Appointment</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FC",
    padding: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 20,
  },

  badgeContainer: {
    marginBottom: 20,
  },

  doctorAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },

  avatarText: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "800",
  },
  doctorName: {
    textAlign: "center",
    marginTop: 18,
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
    color: "#0F172A",
  },

  symptoms: {
    color: "#334155",
    lineHeight: 22,
  },

  cancelledTitle: {
    color: "#DC2626",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
  },

  cancelledText: {
    color: "#475569",
    fontWeight: "600",
    lineHeight: 22,
  },

  editButton: {
    backgroundColor: "#2563EB",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },

  cancelButton: {
    backgroundColor: "#EF4444",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 40,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});

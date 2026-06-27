import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import {
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { minLength } from "../../src/utils/validators";
import GlassCard from "../../src/components/cards/GlassCard";
import ChipSelector from "../../src/components/selectors/ChipSelector";
import DoctorCard from "../../src/components/cards/DoctorCard";
import TimeSlotSelector from "../../src/components/selectors/TimeSlotSelectors";
import PrimaryButton from "../../src/components/buttons/PrimaryButton";
import { useEffect, useState } from "react";
import { getDoctors } from "../../src/services/employee.service";

import {
  getAvailableSlots,
  bookAppointment,
  clearAppointmentCache,
} from "../../src/services/appointment.service";
import { formatLocalDate } from "../../src/utils/date";

export default function BookAppointment() {
  const navigation = useNavigation<any>();

  const [doctors, setDoctors] = useState<any[]>([]);

  const [selectedDepartment, setSelectedDepartment] = useState("");

  const [doctorId, setDoctorId] = useState("");

  const [appointmentDate, setAppointmentDate] = useState("");

  const [appointmentTime, setAppointmentTime] = useState("");

  const [symptoms, setSymptoms] = useState("");

  const [slots, setSlots] = useState<string[]>([]);
  const [errors, setErrors] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const response = await getDoctors();

      setDoctors(response.data.data);
    } catch (error) {
      console.log("DOCTOR ERROR", error);

      Alert.alert("Failed to load doctors");
    }
  };

  const departments = [...new Set(doctors.map((doctor) => doctor.department))];

  const filteredDoctors = doctors.filter(
    (doctor) => doctor.department === selectedDepartment,
  );

  const loadSlots = async () => {
    try {
      if (!doctorId || !appointmentDate) {
        Alert.alert("Please select doctor and date");

        return;
      }

      const response = await getAvailableSlots(doctorId, appointmentDate);

      setSlots(response.data.data);
    } catch (error: any) {
      Alert.alert(
        "Failed",
        error.response?.data?.message ||
          error.message ||
          "Failed to load slots",
      );
    }
  };
  const [showDatePicker, setShowDatePicker] = useState(false);
  const validateForm = () => {
    const newErrors: any = {};

    if (!selectedDepartment) {
      newErrors.department = "Please select department";
    }

    if (!doctorId) {
      newErrors.doctor = "Please select doctor";
    }

    if (!appointmentDate) {
      newErrors.appointmentDate = "Please select appointment date";
    }

    if (!appointmentTime) {
      newErrors.appointmentTime = "Please select time slot";
    }

    if (symptoms && !minLength(symptoms.trim(), 5)) {
      newErrors.symptoms = "Symptoms must contain at least 5 characters";
    }

    if (symptoms.length > 500) {
      newErrors.symptoms = "Maximum 500 characters allowed";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleBookAppointment = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      setSubmitting(true);

      await bookAppointment({
        doctorId,

        appointmentDate,

        appointmentTime,

        symptoms: symptoms.trim() ? [symptoms] : [],
      });
      clearAppointmentCache();

      Alert.alert("Success", "Appointment request sent", [
        {
          text: "OK",

          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      Alert.alert("Failed", error?.response?.data?.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 50,
        }}
      >
        <Text style={styles.title}>Book Appointment</Text>

        <Text style={styles.subtitle}>
          Schedule a consultation with a healthcare specialist.
        </Text>

        <GlassCard>
          <Text style={styles.section}>Select Department</Text>

          <ChipSelector
            label=""
            options={departments}
            selectedValue={selectedDepartment}
            onSelect={(department) => {
              setSelectedDepartment(department);

              setDoctorId("");

              setSlots([]);

              setAppointmentTime("");
            }}
          />
          {errors.department && (
            <Text
              style={{
                color: "#EF4444",
                fontSize: 12,
                marginTop: 8,
              }}
            >
              {errors.department}
            </Text>
          )}
        </GlassCard>

        {selectedDepartment ? (
          <GlassCard>
            <Text style={styles.section}>Select Doctor</Text>

            {filteredDoctors.map((doctor) => (
              <DoctorCard
                key={doctor._id}
                doctor={doctor}
                selected={doctorId === doctor._id}
                onPress={() => {
                  setDoctorId(doctor._id);

                  setSlots([]);

                  setAppointmentTime("");
                }}
              />
            ))}
          </GlassCard>
        ) : null}
        {errors.doctor && (
          <Text
            style={{
              color: "#EF4444",
              fontSize: 12,
              marginTop: -8,
              marginBottom: 15,
            }}
          >
            {errors.doctor}
          </Text>
        )}
        <GlassCard>
          <Text style={styles.section}>Appointment Date</Text>

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {appointmentDate || "Select Date"}
            </Text>
          </TouchableOpacity>
          {errors.appointmentDate && (
            <Text
              style={{
                color: "#EF4444",
                fontSize: 12,
                marginTop: 8,
              }}
            >
              {errors.appointmentDate}
            </Text>
          )}

          {showDatePicker && (
            <DateTimePicker
              mode="date"
              value={new Date()}
              minimumDate={new Date()}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);

                if (selectedDate) {
                  const date = formatLocalDate(selectedDate);

                  setAppointmentDate(date);
                  setSlots([]);
                  setAppointmentTime("");
                  setErrors({
                    ...errors,
                    appointmentDate: "",
                    appointmentTime: "",
                  });
                }
              }}
            />
          )}

          <TouchableOpacity style={styles.loadSlots} onPress={loadSlots}>
            <Text style={styles.loadSlotsText}>Load Available Slots</Text>
          </TouchableOpacity>

          {slots.length > 0 && (
            <>
              <Text
                style={[
                  styles.section,
                  {
                    marginTop: 20,
                  },
                ]}
              >
                Available Slots
              </Text>

              <TimeSlotSelector
                slots={slots}
                selectedSlot={appointmentTime}
                onSelect={(slot) => {
                  setAppointmentTime(slot);
                  setErrors({
                    ...errors,
                    appointmentTime: "",
                  });
                }}
              />
              {errors.appointmentTime && (
                <Text
                  style={{
                    color: "#EF4444",
                    fontSize: 12,
                    marginTop: 10,
                  }}
                >
                  {errors.appointmentTime}
                </Text>
              )}
            </>
          )}
        </GlassCard>
        <GlassCard>
          <Text style={styles.section}>Symptoms</Text>
          <TextInput
            value={symptoms}
            onChangeText={(value) => {
              setSymptoms(value);

              setErrors({
                ...errors,
                symptoms: "",
              });
            }}
            multiline
            placeholder="Describe your symptoms..."
            placeholderTextColor="#94A3B8"
            style={styles.textArea}
          />

          {errors.symptoms && (
            <Text
              style={{
                color: "#EF4444",
                fontSize: 12,
                marginTop: 8,
              }}
            >
              {errors.symptoms}
            </Text>
          )}
        </GlassCard>

        {doctorId && appointmentDate && appointmentTime ? (
          <GlassCard>
            <Text style={styles.section}>Appointment Summary</Text>

            <Text style={styles.summary}>Department: {selectedDepartment}</Text>

            <Text style={styles.summary}>Date: {appointmentDate}</Text>

            <Text style={styles.summary}>Time: {appointmentTime}</Text>
          </GlassCard>
        ) : null}

        <PrimaryButton
          title="Book Appointment"
          loading={submitting}
          onPress={handleBookAppointment}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FC",
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 20,
  },

  subtitle: {
    color: "#64748B",
    marginTop: 8,
    marginBottom: 25,
    lineHeight: 22,
  },

  section: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 15,
  },

  dateButton: {
    height: 56,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    justifyContent: "center",
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  dateText: {
    color: "#334155",
    fontSize: 15,
  },

  loadSlots: {
    backgroundColor: "#2563EB",
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },

  loadSlotsText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  textArea: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    minHeight: 120,
    textAlignVertical: "top",
    color: "#0F172A",
  },

  summary: {
    fontSize: 15,
    color: "#334155",
    marginBottom: 10,
  },
});

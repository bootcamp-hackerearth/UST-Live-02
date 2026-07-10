/**
 * @file AppointmentForm.tsx
 * @overview A comprehensive form for creating and editing appointments.
 * @description This component manages the entire appointment booking/editing process, including doctor search and selection,
 * date picking, and available slot selection. It uses the `useAppointmentData` hook to manage its state and data fetching logic.
 * Form submission is handled here, with API calls made through `appointmentService`.
 * @connections
 * - `APPOINTMENTFORM.TSX` -> `useAppointmentData.ts` (hook) -> Manages state for doctors, slots, selections.
 * - User Interaction (e.g., select doctor, date) -> Triggers state updates in `useAppointmentData` -> `appointmentService.ts` -> Fetches new data (e.g., available slots).
 * - User Submits Form -> `handleFormSubmit()` -> `appointmentService.ts` (`create` or `update` methods) -> `apiClient.ts` -> Backend.
 * - On API success -> Calls `onSuccess` prop (passed from `AppointmentContainer.tsx`).
 * - On API failure -> `Toast.show()` (displays error message).
 */
import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { MaterialIcons, Fontisto } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

import { appointmentService } from "../services/appointmentService";
import { useAppointmentData } from "../hooks/useAppointmentData";
import SelectablePill from "./SelectablePill";
import SearchBar from "./SearchBar";

interface AppointmentFormProps {
  patientUHID: string | undefined;
  isEditMode?: boolean;
  appointmentData?: any;
  preselectedDoctorId?: string;
  onSuccess: () => void;
}

function AppointmentForm({
  patientUHID,
  isEditMode = false,
  appointmentData,
  preselectedDoctorId,
  onSuccess,
}: Readonly<AppointmentFormProps>) {
  const navigation = useNavigation<NavigationProp<any>>();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [doctorSearchQuery, setDoctorSearchQuery] = useState("");
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  const {
    doctors,
    slots,
    selectedDoctor,
    setSelectedDoctor,
    selectedDate,
    setSelectedDate,
    selectedSlot,
    setSelectedSlot,
    tomorrow,
    doctorListRef,
    slotListRef,
  } = useAppointmentData(isEditMode, appointmentData, preselectedDoctorId);

  const filteredDoctors = useMemo(() => {
    if (!doctorSearchQuery.trim()) return doctors;
    const q = doctorSearchQuery.toLowerCase();
    return doctors.filter(
      (d: any) =>
        d.name.toLowerCase().includes(q) ||
        (d.specialization?.toLowerCase().includes(q)),
    );
  }, [doctors, doctorSearchQuery]);

  const maxAppointmentDate = new Date(tomorrow);

  maxAppointmentDate.setMonth(
    maxAppointmentDate.getMonth() +
      Number(process.env.NO_OF_MONTH_ALLOWED_IN_FUTURE_FOR_APPOINTMENT || 6),
  );

  const handleScrollFailed = useCallback(
    (info: any, ref: React.RefObject<FlatList | null>) => {
      setTimeout(
        () =>
          ref.current?.scrollToIndex({
            index: info.index,
            animated: true,
            viewPosition: 0.5,
          }),
        500,
      );
    },
    [],
  );

  const handleFormSubmit = async () => {
    if (!selectedDoctor || !selectedSlot) {
      return Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please select a doctor and an available time slot.",
      });
    }

    setIsLoading(true);

    try {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const exactLocalDate = `${year}-${month}-${day}`;

      const payload = {
        patientId: patientUHID,
        doctorEmployeeID: selectedDoctor,
        date: exactLocalDate,
        timeSlot: selectedSlot,
        status: "Pending",
      };

      if (isEditMode) {
        await appointmentService.updateAppointment(
          appointmentData.appointmentCode,
          payload,
        );

        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Appointment modifications requested.",
        });
      } else {
        await appointmentService.createAppointment(payload);

        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Appointment requested successfully.",
        });
      }
      onSuccess();
    } catch (err: any) {
      const serverErrorMessage =
        err.response?.data?.message ||
        err.message ||
        "An unknown error occurred.";

      Toast.show({
        type: "error",
        text1: "Booking Rejected",
        text2: serverErrorMessage,
      });
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  const renderDoctorItem = useCallback<ListRenderItem<any>>(
    ({ item }) => (
      <SelectablePill
        title={item.name}
        subtitle={item.specialization}
        isSelected={selectedDoctor === item.employeeCode}
        onPress={() => {
          setSelectedDoctor(item.employeeCode);
          setSelectedSlot("");
        }}
      />
    ),
    [selectedDoctor, setSelectedDoctor, setSelectedSlot],
  );

  const renderSlotItem = useCallback<ListRenderItem<string>>(
    ({ item }) => (
      <SelectablePill
        title={item}
        isSelected={selectedSlot === item}
        onPress={() => setSelectedSlot(item)}
      />
    ),
    [selectedSlot, setSelectedSlot],
  );

  return (
    <ScrollView>
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="today" size={24} color="white" />
          </View>
          <View>
            <Text style={styles.subText}>
              {isEditMode ? "MODIFY ENTRY" : "NEW ENTRY"}
            </Text>
            <Text style={styles.cardTitle}>
              {isEditMode ? "Edit Appointment Details" : "Book Appointment"}
            </Text>
          </View>
        </View>

        <Text style={styles.label}>PATIENT ID</Text>
        <View style={styles.disabledInput}>
          <Text style={styles.disabledInputText}>
            {patientUHID || "Fetching..."}
          </Text>
        </View>

        <Text style={styles.label}>SELECT DOCTOR</Text>
        <View style={{ marginBottom: 12 }}>
          <SearchBar
            value={doctorSearchQuery}
            onChangeText={setDoctorSearchQuery}
            placeholder="Search doctors..."
          />
        </View>
        <View style={styles.scrollWrapper}>
          <FlatList
            ref={doctorListRef}
            data={filteredDoctors}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.employeeCode}
            onScrollToIndexFailed={(info) =>
              handleScrollFailed(info, doctorListRef)
            }
            renderItem={renderDoctorItem}
            initialNumToRender={5}
            maxToRenderPerBatch={5}
            windowSize={5}
            removeClippedSubviews={true}
          />
        </View>

        <Text style={styles.label}>SCHEDULE DATE</Text>
        <TouchableOpacity
          style={styles.pickerContainer}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>{selectedDate.toDateString()}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            minimumDate={tomorrow}
            maximumDate={maxAppointmentDate}
            onChange={(e, date) => {
              setShowDatePicker(false);
              if (date) {
                setSelectedDate(date);
                setSelectedSlot("");
              }
            }}
          />
        )}

        {!!selectedDoctor && (
          <>
            <Text style={styles.label}>AVAILABLE SLOTS</Text>
            <View style={styles.scrollWrapper}>
              {slots.length === 0 ? (
                <Text style={styles.noSlotsText}>
                  No slots available for this date.
                </Text>
              ) : (
                <FlatList
                  ref={slotListRef}
                  data={slots}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item}
                  onScrollToIndexFailed={(info) =>
                    handleScrollFailed(info, slotListRef)
                  }
                  renderItem={renderSlotItem}
                  initialNumToRender={8}
                  maxToRenderPerBatch={8}
                  windowSize={5}
                  removeClippedSubviews={true}
                />
              )}
            </View>
          </>
        )}

        <TouchableOpacity
          style={styles.btn}
          onPress={handleFormSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.btnText}>
              {isEditMode ? "Confirm Modifications" : "Request Appointment"}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{ name: "ViewAppointments" }],
            })
          }
        >
          <View style={styles.backBtnContainer}>
            <Fontisto name="close" size={24} color="#4B5563" />
            <Text style={styles.backText}>CANCEL</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

export default React.memo(AppointmentForm);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    padding: 10,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#4B1D76",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  subText: { fontSize: 11, color: "#9CA3AF", fontFamily: "Lexend" },
  cardTitle: { fontSize: 18, fontFamily: "Lexend", color: "#1E1E3F" },
  label: {
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: "Lexend",
    marginBottom: 8,
    marginTop: 16,
  },
  disabledInput: {
    backgroundColor: "#F3F4F6",
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderColor: "#4B1D76",
  },
  disabledInputText: { color: "#1E1E3F", fontFamily: "Lexend" },
  scrollWrapper: { marginHorizontal: -4 },
  noSlotsText: {
    color: "#EF4444",
    fontSize: 14,
    fontStyle: "italic",
    paddingHorizontal: 4,
    marginTop: 4,
    fontFamily: "Lexend",
  },
  pickerContainer: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 8,
    justifyContent: "center",
    height: 55,
    paddingHorizontal: 8,
  },
  dateText: {
    fontSize: 16,
    color: "#1E1E3F",
    paddingLeft: 8,
    fontFamily: "Lexend",
  },
  btn: {
    backgroundColor: "#4B1D76",
    padding: 16,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 24,
  },
  btnText: { color: "#FFF", fontFamily: "Lexend", fontSize: 16 },
  backBtn: {
    backgroundColor: "#F3F4F6",
    padding: 14,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 12,
  },
  backBtnContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  backText: { color: "#4B5563", fontFamily: "Lexend", fontSize: 14 },
});

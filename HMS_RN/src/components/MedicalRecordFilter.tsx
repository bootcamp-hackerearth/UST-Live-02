/**
 * @file MedicalRecordFilter.tsx
 * @overview A component for filtering a list of medical records.
 * @description This component provides a user interface for searching and filtering medical records.
 * It includes a primary search by appointment ID and an advanced section for filtering by doctor and date.
 * - MEDICALRECORDFILTER.TSX -> MedicalRecordsScreen.tsx
 * @connections
 * - `MedicalRecordsScreen.tsx` -> Passes `doctors`, `initialFilters`, and `onFilterChange` callback to `MEDICALRECORDFILTER.TSX`.
 * - User interacts with filters (e.g., types in `SearchBar`, selects a `SelectablePill`) -> Updates internal `filters` state.
 * - User clicks 'Apply' or 'Search' -> `handleApply()` -> Invokes `onFilterChange(filters)` -> `MedicalRecordsScreen.tsx` re-fetches data with new filters.
 */

import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ListRenderItem,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

import SearchBar from "./SearchBar";
import SelectablePill from "./SelectablePill";
import { Doctor } from "./DoctorCarousel";

export interface RecordFilters {
  appointmentId: string;
  doctorId: string | null;
  date: Date | null;
}

interface Props {
  doctors: Doctor[];
  onFilterChange: (filters: RecordFilters) => void;
  initialFilters: RecordFilters;
}

function MedicalRecordFilter({
  doctors,
  onFilterChange,
  initialFilters,
}: Readonly<Props>) {
  const [filters, setFilters] = useState<RecordFilters>(initialFilters);
  const [doctorSearch, setDoctorSearch] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [appointmentIdSearch, setAppointmentIdSearch] = useState(
    filters.appointmentId,
  );

 useEffect(() => {
   setFilters(initialFilters);
   setAppointmentIdSearch(initialFilters.appointmentId || "");
 }, [
   initialFilters.appointmentId,
   initialFilters.doctorId,
   initialFilters.date?.getTime(), // Safely track date changes
 ]);

  const filteredDoctors = useMemo(() => {
    if (!doctorSearch.trim()) return doctors;
    const query = doctorSearch.toLowerCase();
    return doctors.filter(
      (d) =>
        d.name.toLowerCase().includes(query) ||
        d.specialization?.toLowerCase().includes(query),
    );
  }, [doctors, doctorSearch]);

  const handleAppointmentSearch = () => {
    onFilterChange({ ...filters, appointmentId: appointmentIdSearch });
  };

  const handleApply = () => {
    onFilterChange({ ...filters, appointmentId: appointmentIdSearch });
    setShowAdvanced(false);
  };

  const handleClear = () => {
    const clearedFilters = { appointmentId: "", doctorId: null, date: null };
    setAppointmentIdSearch("");
    setDoctorSearch("");
    onFilterChange(clearedFilters);
  };

  const renderDoctorItem = useCallback<ListRenderItem<Doctor>>(
    ({ item }) => (
      <SelectablePill
        title={item.name}
        subtitle={item.specialization}
        isSelected={filters.doctorId === item.employeeCode}
        onPress={() =>
          setFilters((f) => ({ ...f, doctorId: item.employeeCode }))
        }
      />
    ),
    [filters.doctorId],
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBarWrapper}>
          <SearchBar
            value={appointmentIdSearch}
            onChangeText={setAppointmentIdSearch}
            placeholder="Search...."
            onSubmitEditing={handleAppointmentSearch}
          />
        </View>
        <TouchableOpacity
          style={styles.searchBtn}
          onPress={handleAppointmentSearch}
        >
          <Feather name="search" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setShowAdvanced((s) => !s)}
        >
          <Ionicons
            name={showAdvanced ? "close" : "options"}
            size={24}
            color="#FFF"
          />
        </TouchableOpacity>
      </View>

      {showAdvanced && (
        <View style={styles.advancedContainer}>
          <Text style={styles.label}>FILTER BY DOCTOR</Text>
          <SearchBar
            value={doctorSearch}
            onChangeText={setDoctorSearch}
            placeholder="Search for a doctor..."
          />
          <FlatList
            data={filteredDoctors}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.employeeCode}
            renderItem={renderDoctorItem}
            style={styles.doctorList}
          />

          <Text style={styles.label}>FILTER BY DATE</Text>
          <TouchableOpacity
            style={styles.pickerContainer}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {filters.date ? filters.date.toDateString() : "Select a date"}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={filters.date || new Date()}
              mode="date"
              onChange={(e, date) => {
                setShowDatePicker(false);
                if (date) setFilters((f) => ({ ...f, date }));
              }}
            />
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.clearButton]}
              onPress={handleClear}
            >
              <Text style={[styles.btnText, { color: "#4B5563" }]}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.applyButton]}
              onPress={handleApply}
            >
              <Text style={styles.btnText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

export default React.memo(MedicalRecordFilter);

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  searchContainer: { flexDirection: "row", alignItems: "center", gap: 12 },
  searchBarWrapper: {
    flex: 1,
  },
  searchBtn: {
    backgroundColor: "#6C4EDB",
    padding: 12,
    borderRadius: 14,
    height: 50,
    justifyContent: "center",
  },
  filterBtn: {
    backgroundColor: "#6C4EDB",
    padding: 12,
    borderRadius: 14,
    height: 50,
    justifyContent: "center",
  },
  advancedContainer: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 16,
    marginTop: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  label: {
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: "Lexend",
    marginBottom: 8,
    marginTop: 12,
  },
  doctorList: { marginVertical: 8 },
  pickerContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    height: 50,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  dateText: { fontSize: 15, color: "#1E1E3F", fontFamily: "Lexend" },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    padding: 14,
    borderRadius: 25,
    alignItems: "center",
  },
  clearButton: { backgroundColor: "#F3F4F6" },
  applyButton: { backgroundColor: "#6C4EDB" },
  btnText: { color: "#FFF", fontFamily: "Lexend", fontSize: 15 },
});

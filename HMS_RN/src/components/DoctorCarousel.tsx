/**
 * @file DoctorCarousel.tsx
 * @overview Displays a horizontal scrolling list of doctors.
 * @description This component renders a `FlatList` of `DoctorCard` components in a carousel format.
 * It is designed to showcase a list of doctors, for example, on a dashboard or a dedicated doctor listing page.
 * @connections
 * - Parent Component (e.g., a screen) -> Passes `doctors` array prop -> `DOCTORCAROUSEL.TSX`.
 * - `DOCTORCAROUSEL.TSX` -> Renders a `FlatList` where each item is a `DoctorCard` component.
 */
import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ListRenderItem,
} from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";

export interface Doctor {
  _id: string;
  employeeCode: string;
  name: string;
  department: string;
  status: string;
  designation?: string;
  specialization?: string;
}

interface Props {
  doctors: Doctor[];
}

const formatDepartment = (dept: string) => {
  if (!dept) return "General";
  return dept;
};

interface DoctorCardProps {
  doctor: Doctor;
}

const DoctorCard = React.memo(({ doctor }: DoctorCardProps) => {
  console.log(`Data for ${doctor.name}:`, {
    designation: doctor.designation,
    specialization: doctor.specialization,
  });

  return (
    <TouchableOpacity activeOpacity={0.8} style={styles.card}>
      <View>
        <Text style={styles.doctorName} numberOfLines={2}>
          {doctor.name}
        </Text>
        <Text style={styles.designation} numberOfLines={1}>
          {doctor.designation ? doctor.designation : "⚠️ No Designation Data"}
        </Text>
      </View>

      <View>
        <Text style={styles.department} numberOfLines={1}>
          {formatDepartment(doctor.department)}
        </Text>
        <Text style={styles.specialization} numberOfLines={1}>
          {doctor.specialization
            ? doctor.specialization
            : "⚠️ No Specialization Data"}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

const ListSpacer = () => <View style={styles.separator} />;
function DoctorCarouse({ doctors }: Readonly<Props>) {
  const renderDoctorCard = useCallback<ListRenderItem<Doctor>>(
    ({ item }) => <DoctorCard doctor={item} />,
    [],
  );
  return (
    <View style={styles.container}>
      <View style={styles.doctorHeader}>
        <FontAwesome6 name="user-doctor" size={20} color="blue" />
        <Text style={styles.sectionTitle}>Our Top Doctors</Text>
      </View>
      <FlatList
        data={doctors}
        keyExtractor={(item) => item._id}
        renderItem={renderDoctorCard}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={ListSpacer}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={5}
        removeClippedSubviews={true}
      />
    </View>
  );
}

export default React.memo(DoctorCarouse);

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  doctorHeader: {
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#e6e6fb",
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 20,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
    gap: 8,
  },
  sectionTitle: {
    color: "#1E1E3F",
    fontSize: 20,
    fontFamily: "Lexend",
    marginLeft: 10,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  separator: {
    width: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 20,
    width: 170,
    height: 130,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  doctorName: {
    color: "#1E1E3F",
    fontSize: 16,
    fontFamily: "Lexend",
    lineHeight: 22,
  },
  designation: {
    color: "#9CA3AF",
    fontSize: 12,
    fontFamily: "Lexend",
    marginTop: 2,
  },
  department: {
    color: "#6C4EDB",
    fontSize: 13,
    fontFamily: "Lexend",
  },
  specialization: {
    color: "#4B5563",
    fontSize: 11,
    marginTop: 2,
  },
});

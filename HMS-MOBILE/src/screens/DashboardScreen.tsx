import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { removeToken } from "../utils/storage";
import { getProfileApi } from "../api/patient.api";

export default function DashboardScreen({ navigation }: any) {
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const profileRes = await getProfileApi();
      const p = profileRes.data?.data;
      if (p) {
        setPatientName(`${p.firstName} ${p.lastName}`);
        setPatientId(p.patientId ?? "");
      }
    } catch (err) {
      // fail silently
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await removeToken();
          navigation.replace("Login");
        },
      },
    ]);
  };

  const initials = patientName
    ? patientName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "P";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Top Header ── */}
        <View style={styles.headerBg}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greeting}>Good day 👋</Text>
              <Text style={styles.patientName}>
                {patientName || "Patient"}
              </Text>
              {patientId ? (
                <Text style={styles.patientId}>ID: {patientId}</Text>
              ) : null}
            </View>
            <TouchableOpacity
              style={styles.avatarBtn}
              onPress={() => navigation.navigate("Profile")}
            >
              <Text style={styles.avatarText}>{initials}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Quick Actions ── */}
        <View style={styles.body}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.actionsGrid}>
            <ActionCard
              icon="📋"
              label="View Appointments"
              color="#eff6ff"
              iconBg="#2563eb"
              onPress={() => navigation.navigate("Appointments")}
            />
            <ActionCard
              icon="➕"
              label="Book Appointment"
              color="#f0fdf4"
              iconBg="#16a34a"
              onPress={() => navigation.navigate("BookAppointment")}
            />
            <ActionCard
              icon="👤"
              label="My Profile"
              color="#faf5ff"
              iconBg="#7c3aed"
              onPress={() => navigation.navigate("Profile")}
            />
            <ActionCard
              icon="🚪"
              label="Logout"
              color="#fff1f2"
              iconBg="#dc2626"
              onPress={handleLogout}
            />
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function ActionCard({
  icon, label, color, iconBg, onPress,
}: {
  icon: string; label: string; color: string; iconBg: string; onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[actionStyles.card, { backgroundColor: color }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[actionStyles.iconCircle, { backgroundColor: iconBg }]}>
        <Text style={actionStyles.icon}>{icon}</Text>
      </View>
      <Text style={actionStyles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f0f4ff" },

  headerBg: {
    backgroundColor: "#1e3a8a",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  greeting:    { color: "#93c5fd", fontSize: 13, marginBottom: 2 },
  patientName: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  patientId:   { color: "#93c5fd", fontSize: 12, marginTop: 2 },
  avatarBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#93c5fd",
  },
  avatarText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  body:         { padding: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 14,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
});

const actionStyles = StyleSheet.create({
  card: {
    width: "47%",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  icon:  { fontSize: 22 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "center",
  },
});
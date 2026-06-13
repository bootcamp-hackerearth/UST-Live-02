import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getMyPatientAppointmentsApi, getProfileApi } from "../api/patient.api";
import { AppNavigation, ROUTES } from "../navigation/routes";
import { clearSession } from "../utils/storage";
import { colors, radius, shadow, spacing } from "../theme";

type DashboardScreenProps = {
  navigation: AppNavigation;
};

type PatientProfile = {
  firstName?: string;
  lastName?: string;
  patientId?: string;
};

type AppointmentSummary = {
  appointmentDate: string;
};

const HERO_SUPPORT_TEXT_COLOR = "#c8d8ff";
const APPOINTMENT_TILE_COLOR = colors.primary;
const BOOKING_TILE_COLOR = colors.success;
const PROFILE_TILE_COLOR = colors.accent;
const LOGOUT_TILE_COLOR = colors.danger;

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [todayCount, setTodayCount] = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const today = toApiDate(new Date());

    try {
      const profileRes = await getProfileApi();
      setProfile(profileRes.data?.data ?? null);
    } catch (error) {
      console.log("DASHBOARD PROFILE LOAD ERROR:", error);
      setProfile(null);
    }

    try {
      const appointmentsRes = await getMyPatientAppointmentsApi();
      const appointments: AppointmentSummary[] = appointmentsRes.data?.data ?? [];

      setTodayCount(
        appointments.filter((appointment) => toApiDate(new Date(appointment.appointmentDate)) === today).length,
      );
      setUpcomingCount(
        appointments.filter((appointment) => toApiDate(new Date(appointment.appointmentDate)) > today).length,
      );
    } catch (error) {
      console.log("DASHBOARD APPOINTMENTS LOAD ERROR:", error);
      setTodayCount(0);
      setUpcomingCount(0);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Do you want to end your current session?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await clearSession();
          navigation.reset({
            index: 0,
            routes: [{ name: ROUTES.login }],
          });
        },
      },
    ]);
  };

  const patientName = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") || "Patient";
  const initials = [profile?.firstName, profile?.lastName]
    .filter(isNonEmptyString)
    .map((name: string) => name.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase() || "P";

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        nestedScrollEnabled
      >
        <View style={styles.hero}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.greeting}>Welcome back</Text>
              <Text style={styles.name}>{patientName}</Text>
              <Text style={styles.patientId}>ID: {profile?.patientId ?? "PATIENT"}</Text>
            </View>
            <TouchableOpacity style={styles.avatar} onPress={() => navigation.navigate(ROUTES.profile)}>
              <Text style={styles.avatarText}>{initials}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <StatCard eyebrow="Today" value={todayCount} label="Appointments" />
            <StatCard eyebrow="Next" value={upcomingCount} label="Upcoming" />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <Text style={styles.sectionSubtitle}>Manage your care in one place</Text>
        </View>

        <View style={styles.grid}>
          <ActionTile
            icon="A"
            title="View Appointments"
            color={APPOINTMENT_TILE_COLOR}
            onPress={() => navigation.navigate(ROUTES.appointments)}
          />
          <ActionTile
            icon="+"
            title="Book Appointment"
            color={BOOKING_TILE_COLOR}
            onPress={() => navigation.navigate(ROUTES.bookAppointment)}
          />
          <ActionTile
            icon="P"
            title="My Profile"
            color={PROFILE_TILE_COLOR}
            onPress={() => navigation.navigate(ROUTES.profile)}
          />
          <ActionTile
            icon="L"
            title="Logout"
            color={LOGOUT_TILE_COLOR}
            onPress={handleLogout}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ eyebrow, value, label }: { eyebrow: string; value: number; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{eyebrow}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActionTile({
  icon,
  title,
  color,
  onPress,
}: {
  icon: string;
  title: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.tile} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.tileIcon, { backgroundColor: color }]}>
        <Text style={styles.tileIconText}>{icon}</Text>
      </View>
      <Text style={styles.tileTitle}>{title}</Text>
    </TouchableOpacity>
  );
}

const toApiDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isNonEmptyString = (value: string | undefined): value is string =>
  Boolean(value);

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  hero: {
    backgroundColor: colors.primaryDark,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  heroTopRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  greeting: {
    color: HERO_SUPPORT_TEXT_COLOR,
    fontSize: 13,
    fontWeight: "700",
  },
  name: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "900",
    marginTop: 4,
  },
  patientId: {
    color: HERO_SUPPORT_TEXT_COLOR,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderColor: "rgba(255,255,255,0.35)",
    borderRadius: 28,
    borderWidth: 2,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "900",
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  statCard: {
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: radius.lg,
    flex: 1,
    padding: spacing.md,
  },
  statIcon: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: spacing.xs,
    textTransform: "uppercase",
  },
  statValue: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "900",
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
    textAlign: "center",
  },
  sectionHeader: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
  },
  sectionSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: spacing.md,
    marginTop: 3,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  tile: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    minHeight: 128,
    padding: spacing.lg,
    width: "47.5%",
    ...shadow,
  },
  tileIcon: {
    alignItems: "center",
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    marginBottom: spacing.md,
    width: 56,
  },
  tileIconText: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "900",
  },
  tileTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },
});

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useCallback, useMemo } from "react";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "../../src/services/patient.service";
import DashboardSkeleton from "../../src/components/loaders/DashboardSkeleton";
import OfflineBanner from "../../src/components/common/OfflineBanner";
import OfflineSkeletonState from "../../src/components/loaders/OfflineSkeletonState";
import GlassCard from "../../src/components/cards/GlassCard";
import StatCard from "../../src/components/cards/StatCard";
import QuickActionCard from "../../src/components/cards/QuickActionCard";
import useOfflineStatus from "../../src/hooks/useOfflineStatus";
import { logger } from "../../src/utils/logger";

export default function Dashboard() {
  const navigation = useNavigation<any>();
  const offline = useOfflineStatus();
  const {
    data: dashboard,
    isPending,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["dashboard", "patient"],
    queryFn: async () => {
      const response = await getDashboard();

      return response.data.data;
    },
  });

  const onRefresh = useCallback(async () => {
    try {
      await refetch();
    } catch (error) {
      logger.error("Dashboard refresh failed", error);
    }
  }, [refetch]);
  const goToBook = useCallback(
    () => navigation.navigate("BookAppointment"),
    [navigation],
  );

  const goToAppointments = useCallback(
    () => navigation.navigate("Appointments"),
    [navigation],
  );

  const goToProfile = useCallback(
    () => navigation.navigate("Profile"),
    [navigation],
  );

  const goToRecords = useCallback(
    () => navigation.navigate("HealthRecords"),
    [navigation],
  );
  const goToUpcomingAppointment = useCallback(() => {
    const id = dashboard?.upcomingAppointment?._id;

    if (!id) {
      return;
    }

    navigation.navigate("AppointmentDetail", {
      id,
    });
  }, [dashboard, navigation]);
  const greeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour < 12) {
      return "Good Morning";
    }

    if (hour < 18) {
      return "Good Afternoon";
    }

    return "Good Evening";
  }, []);

  const appointmentText = useMemo(() => {
    if (!dashboard?.upcomingAppointment) {
      return "Upcoming Consultation";
    }

    const today = new Date();

    const appointment = new Date(dashboard.upcomingAppointment.appointmentDate);

    const diff = Math.ceil(
      (appointment.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diff <= 0) {
      return "Today";
    }

    if (diff === 1) {
      return "Tomorrow";
    }

    return `In ${diff} days`;
  }, [dashboard]);
  if ((isPending || offline) && !dashboard) {
    return (
      <SafeAreaView style={styles.container}>
        {offline ? (
          <OfflineSkeletonState message="Loading saved dashboard data while offline." />
        ) : (
          <DashboardSkeleton />
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
        }
      >
        {offline ? <OfflineBanner /> : null}

        <View style={styles.hero}>
          <Text style={styles.greeting}>{greeting}</Text>

          <Text style={styles.name}>{dashboard?.patient?.firstName}</Text>

          <View style={styles.patientBadge}>
            <Text style={styles.badgeText}>
              ID: {dashboard?.patient?.patientId}
            </Text>
          </View>
        </View>

        <Text style={styles.section}>Quick Actions</Text>

        <View style={styles.quickRow}>
          <QuickActionCard title="Book" onPress={goToBook} />

          <QuickActionCard title="Appointments" onPress={goToAppointments} />
        </View>

        <View style={styles.quickRow}>
          <QuickActionCard title="Profile" onPress={goToProfile} />
          <QuickActionCard title="Records" onPress={goToRecords} />
        </View>

        <Text style={styles.section}>Appointment Summary</Text>

        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 14,
            justifyContent: "space-between",
            marginBottom: 15,
          }}
        >
          <StatCard
            title="Pending"
            value={dashboard?.appointmentSummary?.pending || 0}
          />

          <StatCard
            title="Booked"
            value={dashboard?.appointmentSummary?.booked || 0}
          />

          <StatCard
            title="Completed"
            value={dashboard?.appointmentSummary?.completed || 0}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            marginTop: 18,
          }}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: "#2563EB",
              padding: 12,
              borderRadius: 12,
              alignItems: "center",
              marginRight: 10,
            }}
            onPress={goToUpcomingAppointment}
          >
            <Text
              style={{
                color: "#fff",
                fontWeight: "700",
              }}
            >
              View
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: "#EFF6FF",
              padding: 12,
              borderRadius: 12,
              alignItems: "center",
            }}
            onPress={goToAppointments}
          >
            <Text
              style={{
                color: "#2563EB",
                fontWeight: "700",
              }}
            >
              All Appointments
            </Text>
          </TouchableOpacity>
        </View>
        <GlassCard>
          <Text
            style={{
              color: "#64748B",
            }}
          >
            {appointmentText}
          </Text>

          {dashboard?.upcomingAppointment ? (
            <View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 15,
                }}
              >
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: "#DBEAFE",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12,
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "800",
                      color: "#2563EB",
                    }}
                  >
                    DR
                  </Text>
                </View>

                <View>
                  <Text
                    style={{
                      fontWeight: "700",
                      fontSize: 16,
                    }}
                  >
                    Dr.{" "}
                    {dashboard?.upcomingAppointment?.doctorEmployeeId?.name ||
                      "Not Assigned"}
                  </Text>

                  <Text
                    style={{
                      color: "#64748B",
                    }}
                  >
                    Upcoming Consultation
                  </Text>
                </View>
              </View>

              <Text style={styles.info}>
                Date:{" "}
                {dashboard?.upcomingAppointment?.appointmentDate?.split("T")[0]}
              </Text>

              <Text style={styles.info}>
                Time: {dashboard?.upcomingAppointment?.timeSlot}
              </Text>
            </View>
          ) : (
            <Text style={styles.empty}>No upcoming appointment</Text>
          )}
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FC",
  },
  hero: {
    backgroundColor: "#2563EB",
    padding: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  greeting: {
    color: "#DBEAFE",
    fontSize: 16,
  },
  name: {
    fontSize: 30,
    fontWeight: "800",
    color: "#fff",
    marginTop: 5,
  },
  patientBadge: {
    marginTop: 12,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: "#fff",
  },
  section: {
    fontSize: 18,
    fontWeight: "700",
    margin: 20,
    color: "#0F172A",
  },
  quickRow: {
    flexDirection: "row",
    paddingHorizontal: 14,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 14,
    gap: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
  },
  info: {
    fontSize: 15,
    marginBottom: 8,
  },
  empty: {
    color: "#64748B",
  },
  journeyText: {
    color: "#64748B",
    lineHeight: 22,
  },
  bookButton: {
    marginTop: 20,
    backgroundColor: "#2563EB",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  bookText: {
    color: "#fff",
    fontWeight: "700",
  },
  scrollContent: {
    paddingBottom: 120,
  },
});

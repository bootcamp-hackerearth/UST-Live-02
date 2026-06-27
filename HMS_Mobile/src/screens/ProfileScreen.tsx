import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState, useCallback } from "react";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import { getProfile } from "../services/patient.service";

import { logout } from "../services/auth.service";

import { removeTokens } from "../storage/token.storage";

import { resetToLogin } from "../navigation/RootNavigation";
import { clearAppointmentCache } from "../services/appointment.service";
import { clearDoctorsCache } from "../services/employee.service";

import GlassCard from "../components/cards/GlassCard";
import ProfileInfoCard from "../components/cards/ProfileInfoCard";

interface Profile {
  patientId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  bloodGroup?: string;
  gender?: string;
  dateOfBirth?: string;

  emergencyContactName?: string;
  emergencyContactPhone?: string;
  relationship?: string;

  allergies?: string;
  chronicDiseases?: string;
  currentMedications?: string;
  pastSurgeries?: string;
}

export default function ProfileScreen() {
  const navigation = useNavigation<any>();

  const [profile, setProfile] = useState<Profile | null>(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getProfile();

      setProfile(response.data.data);
    } catch (error) {
      console.log("PROFILE ERROR:", error);

      Alert.alert("Error", "Unable to load profile.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile(true);
    }, []),
  );

  const onRefresh = useCallback(() => {
    loadProfile(true);
  }, []);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
          } catch {}

          clearAppointmentCache();
          clearDoctorsCache();

          await removeTokens();

          resetToLogin();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563EB" />

          <Text style={styles.loaderText}>Loading Profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{
          paddingBottom: 140,
        }}
      >
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.firstName?.charAt(0)?.toUpperCase() || "P"}
            </Text>
          </View>

          <Text style={styles.name}>
            {profile?.firstName} {profile?.lastName}
          </Text>

          <View style={styles.idBadge}>
            <Text style={styles.idText}>ID: {profile?.patientId}</Text>
          </View>
        </View>

        <Text style={styles.section}>Personal Information</Text>

        <ProfileInfoCard label="Email Address" value={profile?.email || "-"} />

        <ProfileInfoCard label="Phone Number" value={profile?.phone || "-"} />

        <GlassCard>
          <Text style={styles.cardTitle}>Medical Information</Text>

          <Text style={styles.info}>
            Blood Group: {profile?.bloodGroup || "Not Added"}
          </Text>

          <Text style={styles.info}>
            Gender: {profile?.gender || "Not Added"}
          </Text>

          <Text style={styles.info}>
            Date Of Birth:{" "}
            {profile?.dateOfBirth
              ? profile.dateOfBirth.split("T")[0]
              : "Not Added"}
          </Text>
        </GlassCard>

        <GlassCard>
          <Text style={styles.cardTitle}>Healthcare ID</Text>

          <Text style={styles.cardValue}>{profile?.patientId}</Text>

          <Text style={styles.cardSubtext}>Registered Patient</Text>
        </GlassCard>

        <GlassCard>
          <Text style={styles.cardTitle}>Emergency Contact</Text>

          <Text style={styles.info}>
            Name: {profile?.emergencyContactName || "Not Added"}
          </Text>

          <Text style={styles.info}>
            Phone: {profile?.emergencyContactPhone || "Not Added"}
          </Text>

          <Text style={styles.info}>
            Relationship: {profile?.relationship || "Not Added"}
          </Text>
        </GlassCard>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate("EditProfile")}
        >
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
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

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loaderText: {
    marginTop: 16,
    color: "#64748B",
    fontSize: 16,
  },

  header: {
    alignItems: "center",
    marginBottom: 30,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "800",
  },

  name: {
    fontSize: 26,
    fontWeight: "800",
    marginTop: 15,
    color: "#0F172A",
  },

  idBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
  },

  idText: {
    color: "#2563EB",
    fontWeight: "600",
  },

  section: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 15,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },

  cardValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2563EB",
  },

  cardSubtext: {
    color: "#64748B",
    marginTop: 8,
  },

  editButton: {
    backgroundColor: "#2563EB",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
  },

  logoutButton: {
    backgroundColor: "#EF4444",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 40,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  info: {
    fontSize: 15,
    color: "#334155",
    marginBottom: 10,
    lineHeight: 22,
  },
});

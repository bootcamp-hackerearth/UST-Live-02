import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useNavigation,
  NavigationProp,
  useFocusEffect,
} from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import Toast from "react-native-toast-message";
import { PatientProfile } from "../features/auth/types";
import ProfileField from "../components/ProfileField";
import PatientForm from "../components/PatientForm";

import { patientService } from "../services/patientService";

import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const backgroundImage = require("../../assets/images/hospital3.jpg");
  const navigation = useNavigation<NavigationProp<any>>();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setIsEditing(false);
      };
    }, []),
  );

  const loadProfile = async () => {
    try {
      const profileString = await SecureStore.getItemAsync("patient_profile");
      if (profileString) {
        setProfile(JSON.parse(profileString));
      }
    } catch (error) {
      console.error("Failed to load profile", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (data: any) => {
    if (!profile?.UHID) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "User identification missing.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        phone: data.phone.trim(),
        gender: data.gender,
        dob: data.dob.toISOString().split("T")[0],
        bloodGroup: data.bloodGroup,
        allergies: data.allergies
          ? data.allergies.split(",").map((a: string) => a.trim())
          : [],
        emergencyContact: data.emergencyContact
          ? data.emergencyContact.trim()
          : null,
        address: {
          line1: data.line1.trim(),
          line2: data.line2 ? data.line2.trim() : "",
          state: data.state.trim(),
          pincode: Number.parseInt(data.pincode, 10),
        },
      };

      await patientService.updateProfile(profile.UHID, payload);

      const updatedProfile = { ...profile, ...payload };
      setProfile(updatedProfile);
      await SecureStore.setItemAsync(
        "patient_profile",
        JSON.stringify(updatedProfile),
      );

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Profile updated successfully.",
      });
      setIsEditing(false);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message,
      });
      console.error("Profile Update Failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const executeLogout = async () => {
    try {
      await SecureStore.deleteItemAsync("patient_jwt");
      await SecureStore.deleteItemAsync("patient_profile");

      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.error("Error clearing session:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to clear session data safely.",
      });
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out of your account?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          executeLogout();
        },
      },
    ]);
  };

  const getInitialEditValues = () => {
    if (!profile) return {};
    return {
      ...profile,
      dob: profile.dob ? new Date(profile.dob) : undefined,
      allergies: profile.allergies ? profile.allergies.join(", ") : "",
      line1: profile.address?.line1 || "",
      line2: profile.address?.line2 || "",
      state: profile.address?.state || "",
      pincode: profile.address?.pincode?.toString() || "",
    };
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center} edges={["top", "left", "right"]}>
        <ActivityIndicator size="large" color="#6C4EDB" />
      </SafeAreaView>
    );
  }

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.backgroundImage}
      imageStyle={{ opacity: 0.3 }}
    >
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarIcon}>
                <Ionicons name="person-outline" size={50} color="black" />
              </Text>
            </View>
            <Text style={styles.nameText}>{profile?.name}</Text>

            <TouchableOpacity
              style={[styles.editButton, isEditing && styles.cancelButton]}
              onPress={() => setIsEditing(!isEditing)}
            >
              <Text style={styles.editButtonText}>
                {isEditing ? "Cancel Edit" : "Edit Profile"}
              </Text>
            </TouchableOpacity>
          </View>

          {isEditing ? (
            <PatientForm
              initialValues={getInitialEditValues()}
              onSubmit={(data) => {
                handleUpdateProfile(data);
              }}
              isLoading={isSaving}
              buttonText="Save Changes"
              isEditMode={true}
            />
          ) : (
            <>
              <View style={styles.card}>
                <ProfileField label="UHID" value={profile?.UHID} />
                <ProfileField label="Email" value={profile?.email} />
                <ProfileField label="Name" value={profile?.name} />
                <ProfileField label="Phone" value={profile?.phone} />
                <ProfileField label="Gender" value={profile?.gender} />
                <ProfileField
                  label="Date of Birth"
                  value={
                    profile?.dob
                      ? new Date(profile.dob).toLocaleDateString()
                      : ""
                  }
                />
                <ProfileField label="Blood Group" value={profile?.bloodGroup} />
                <ProfileField
                  label="Emergency Contact"
                  value={profile?.emergencyContact}
                />
                <ProfileField
                  label="Allergies"
                  value={profile?.allergies?.join(", ")}
                />
                <ProfileField label="Address" value={profile?.address?.line1} />
                <ProfileField
                  label="State / City"
                  value={profile?.address?.state}
                />
                <ProfileField
                  label="Postcode"
                  value={profile?.address?.pincode?.toString()}
                  hideBorder
                />
              </View>

              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  backgroundImage: {
    flex: 1,
    backgroundColor: "#E6F0F2",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { padding: 20, paddingBottom: 24 },
  header: { alignItems: "center", marginBottom: 24, position: "relative" },
  settingsIcon: {
    position: "absolute",
    right: 0,
    top: 20,
    backgroundColor: "#E5E7EB",
    padding: 8,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#987cfc",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 10,
  },
  avatarIcon: { fontSize: 40, color: "#FFFFFF" },
  nameText: {
    fontSize: 24,
    fontFamily: "Lexend",
    color: "#1E1E3F",
    marginBottom: 16,
  },
  editButton: {
    backgroundColor: "#6C4EDB",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
  },
  cancelButton: { backgroundColor: "#EF4444" },
  editButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: "#FEE2E2",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  logoutButtonText: {
    color: "#EF4444",
    fontSize: 16,
    fontFamily: "Lexend",
  },
});

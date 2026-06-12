const BgImage = require("../../assets/img/cover.jpg");
import {
  StyleSheet,
  View,
  ImageBackground,
  ScrollView,
  Alert,
} from "react-native";
import { SectionDivider } from "../components/profile/section-divider.component";
import { InfoCard } from "../components/profile/info-card.component";
import { ProfileCard } from "../components/profile/profile-card.component";
import { clearSecureStorage, deleteToken } from "../services/auth.service";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { NavigationModel } from "../types/navigation.types";
import { useEffect, useState } from "react";
import { PatientModel } from "../types/user.types";
import { getPatientProfile } from "../services/user.service";
import ProfileButton from "../components/profile/profile-button.component";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileScreen() {
  const navigator = useNavigation<NativeStackNavigationProp<NavigationModel>>();
  const [patientData, setPatientData] = useState<PatientModel>();

  useEffect(() => {
    fetchData();
  }, []);

  const logout = async () => {
    await deleteToken();
    await clearSecureStorage();
    navigator.replace("login");
  };

  const fetchData = async () => {
    try {
      const email = await AsyncStorage.getItem("email");
      const data = await getPatientProfile(email ?? "");
      setPatientData(data);
    } catch (err) {
      console.error(err);
      Alert.alert("Failed", "Error fetching profile data");
    }
  };

  const formatDate = (date: string) => {
    const inputDate = new Date(date);
    if (!inputDate) return "";
    const formattedDate = new Date(inputDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return formattedDate;
  };

  const goToEditProfile = () => {
    navigator.navigate("editProfile");
  }

  return (
    <ImageBackground source={BgImage} style={styles.wrapper} resizeMode="cover">
      <View style={styles.overlay}>
        <ProfileCard
          prefix={patientData?.name.slice(0, 3).toUpperCase()}
          name={patientData?.name}
          designation={patientData?.role}
          id={patientData?.uhid}
        />
        <View
          style={styles.container}
        >
          <ScrollView>
            <SectionDivider iconName="person-outline" title="PERSONAL INFO" />
            <InfoCard
              iconName="person-outline"
              title="NAME"
              value={patientData?.name}
            />
            <InfoCard
              iconName="male-outline"
              title="GENDER"
              value={patientData?.gender}
            />
            <InfoCard
              iconName="calendar-outline"
              title="DOB"
              value={formatDate(patientData?.dob || "")}
            />
            <SectionDivider iconName="call-outline" title="CONTACT INFO" />
            <InfoCard
              iconName="call-outline"
              title="PHONE"
              value={patientData?.phone}
            />
            <InfoCard
              iconName="mail-outline"
              title="EMAIL"
              value={patientData?.email}
            />
            <InfoCard
              iconName="location-outline"
              title="ADDRESS"
              value={patientData?.address}
            />
            <InfoCard
              iconName="alert-circle-outline"
              title="EMERGENCY CONTACT"
              value={patientData?.emergencyContact || "No Emergency Contact"}
            />
            <SectionDivider
              iconName="settings-outline"
              title="ACCOUNT SETTINGS"
            />
            <ProfileButton
              iconName="pencil-outline"
              title="EDIT PROFILE"
              onAction={goToEditProfile}
            />
            <ProfileButton
              iconName="exit-outline"
              title="LOGOUT"
              onAction={logout}
            />
          </ScrollView>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  text: {
    fontFamily: "Sans",
  },

  subHeader: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 0,
    padding: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    flexDirection: "row",
    backgroundColor: "rgba(121, 89, 89, 0.4)",
    borderColor: "rgba(205, 69, 255, 0.3)",
    borderWidth: 1,
    justifyContent: "space-around",
    alignItems: "center",
  },
  subHeaderItem: {
    flexDirection: "row",
  },
  labelText: {
    fontSize: 16,
    lineHeight: 18,
    color: "white",
    marginHorizontal: 10,
  },
  valueText: {
    fontSize: 14,
    lineHeight: 20,
    color: "white",
    backgroundColor: "rgba(207, 75, 255, 0.6)",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 8,
  },

  container: {
    flex: 1,
    borderRadius: 19,
    marginTop: 13,
    marginHorizontal: 20,
    backgroundColor: "#f2f2f2",
    borderColor: "rgba(207, 75, 255, 0.2)",
    borderWidth: 1,
    marginBottom: 30,
    padding:20,
  },
});

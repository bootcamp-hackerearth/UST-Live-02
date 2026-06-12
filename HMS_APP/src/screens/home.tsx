const BgImage = require("../../assets/img/cover.jpg");
import {
  ImageBackground,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { WelcomeTextContainer } from "../components/auth/welcome-text-container";
import { LinearGradient } from "expo-linear-gradient";
import { DoctorCard } from "../components/home/doctor-card.component";
import { useEffect, useState } from "react";
import { UserModel } from "../types/user.types";
import { getDoctors } from "../services/user.service";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { NavigationModel } from "../types/navigation.types";

export default function HomeScreen() {
  const navigator = useNavigation<NativeStackNavigationProp<NavigationModel>>();
  const [doctors, setDoctors] = useState<UserModel[]>([]);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    const data = await getDoctors();
    setDoctors(data);
  };

  const goToAppointments = () => {
    navigator.navigate("tabs", {
      screen: "appointment",
    });
  };

  return (
    <ImageBackground source={BgImage} resizeMode="cover" style={styles.wrapper}>
      <View style={styles.overlay}>
        <WelcomeTextContainer
          text1="Find Experienced,"
          text2="DOCTORS"
          text3="Ready to care for you."
          isHome={true}
        />
        <FlatList
          style={styles.container}
          data={doctors}
          keyExtractor={(item) => item.employeeCode}
          renderItem={({ item }) => {
            return (
              <DoctorCard
                prefix={item.name.slice(0, 3).toUpperCase()}
                name={item.name}
                designation={item.designation}
                specialization={item.specialization}
              />
            );
          }}
        />
        <LinearGradient
          style={styles.appointmentContainer}
          colors={["rgba(81, 14, 122, 0.9)", "rgb(79, 62, 67)"]}
        >
          <Text style={[styles.text, styles.appointmentText]}>
            A healthier you,
          </Text>
          <Text style={[styles.text, styles.appointmentText]}>
            Begins today!
          </Text>
          <TouchableOpacity style={styles.bookButton} onPress={goToAppointments}>
            <Text style={[styles.text, styles.bookText]}>Book Now</Text>
          </TouchableOpacity>
        </LinearGradient>
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
  container: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  appointmentContainer: {
    height: 235,
    padding: 20,
    marginTop: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(215, 32, 247, 0.2)",
    marginHorizontal: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontFamily: "Sans",
  },
  appointmentText: {
    fontSize: 20,
    lineHeight: 25,
    color: "white",
  },
  appointmentSubText: {
    fontSize: 23,
    lineHeight: 23,
    color: "white",
  },
  bookButton: {
    padding: 10,
    width: 200,
    borderRadius: 8,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  bookText: {
    fontSize: 14,
    lineHeight: 14,
    color: "white",
  },
});

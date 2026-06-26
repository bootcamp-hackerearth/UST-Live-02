const BgImage = require("../../assets/img/cover.jpg");
import {
  ImageBackground,
  StyleSheet,
  View,
  Text,
  ListRenderItem,
  FlatList,
} from "react-native";
import { WelcomeTextContainer } from "../components/auth/welcome-text-container";
import { DoctorCard } from "../components/home/doctor-card.component";
import { useCallback, useEffect, useState } from "react";
import { UserModel } from "../types/user.types";
import { getDoctors } from "../services/user.service";
import SearchBox from "../components/home/search-box.component";
import SelectHolder from "../components/home/select-holder.component";
import { getSpecializations } from "../services/ui.service";
import { SpecializationModel } from "../types/ui.types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { NavigationModel } from "../types/navigation.types";

export default function HomeScreen() {
  const navigator = useNavigation<NativeStackNavigationProp<NavigationModel>>();

  const [doctors, setDoctors] = useState<UserModel[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<UserModel[]>([]);

  const [specializations, setSpecializations] = useState<SpecializationModel[]>(
    [],
  );

  const [selectedSpecialization, setSelectedSpecialization] = useState("");

  const renderItem: ListRenderItem<UserModel> = useCallback(
    ({ item }) => (
      <DoctorCard
        prefix={item.name.slice(0, 2).toUpperCase()}
        name={item.name}
        designation={item.designation}
        specialization={item.specialization}
        onPress={() => {
          navigator.navigate("tabs", {
            screen: "appointment",
            params: {
              doctorId: item.employeeCode,
            },
          });
        }}
      />
    ),
    [],
  );

  const renderSpecialization: ListRenderItem<SpecializationModel> = useCallback(
    ({ item }) => (
      <SelectHolder
        name={item.specialization_name}
        onPress={() => {
          const newValue =
            selectedSpecialization === item.specialization_name
              ? ""
              : item.specialization_name;
          setSelectedSpecialization(newValue);
          filterData(newValue);
        }}
        isSelected={selectedSpecialization === item.specialization_name}
      />
    ),
    [selectedSpecialization],
  );

  useEffect(() => {
    fetchDoctors();
    fetchSpecializations();
  }, []);

  const fetchDoctors = async () => {
    const data = await getDoctors();
    setDoctors(data);
    setFilteredDoctors(data);
  };

  const fetchSpecializations = async () => {
    const data = await getSpecializations();
    setSpecializations(data);
  };

  const filterData = async (value: string) => {
    if (!normalize(value)) {
      setFilteredDoctors(doctors);
      return;
    }

    const data = doctors.filter((doctor) => {
      const doctor_search = normalize(doctor.name).includes(normalize(value));
      const specialization_search = normalize(doctor.specialization).includes(
        normalize(value),
      );
      return doctor_search || specialization_search;
    });
    setFilteredDoctors(data);
  };

  const normalize = (text: string) => {
    return text.toLowerCase().trim();
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
        <SearchBox
          placeholder="Search Doctor or Specialization"
          onChangeText={filterData}
        />
        <View style={styles.container}>
          <View style={styles.contentHolder}>
            <Text style={[styles.text, styles.contentTitle]}>
              Specialization
            </Text>
            <FlatList
              key="3-columns"
              data={specializations}
              keyExtractor={(item) => item.specialization_id.toString()}
              renderItem={renderSpecialization}
              numColumns={3}
            ></FlatList>
          </View>
          <View style={styles.contentHolder}>
            <Text style={[styles.text, styles.contentTitle]}>
              Available Doctors
            </Text>
            <FlatList
              horizontal
              data={filteredDoctors}
              keyExtractor={(item) => item.employeeCode}
              renderItem={renderItem}
            />
          </View>
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
  container: {
    backgroundColor: "rgb(255, 255, 255)",
    flex: 1,
    marginTop: 10,
    paddingVertical: 50,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  contentHolder: {
    marginHorizontal: 20,
    marginVertical: 5,
    borderRadius: 10,
    padding: 10,
  },
  contentTitle: {
    fontSize: 16,
    color: "rgb(109, 109, 109)",
  },
});

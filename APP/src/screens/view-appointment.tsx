const BgImage = require("../../assets/img/cover.jpg");
import {
  ImageBackground,
  View,
  StyleSheet,
  Text,
  FlatList,
  ListRenderItem,
  ActivityIndicator,
} from "react-native";
import { WelcomeTextContainer } from "../components/auth/welcome-text-container";
import { AppointmentCard } from "../components/appointment/appointment-card.component";
import { useCallback, useEffect, useState } from "react";
import { AppointmentModel } from "../types/appointment.types";
import ProfileButton from "../components/profile/profile-button.component";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { NavigationModel } from "../types/navigation.types";
import { useNavigation } from "@react-navigation/native";
import { getAppointmentsByPatientId } from "../services/appointment.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FormHeader } from "../components/appointment/form-header.component";
import SearchBox from "../components/home/search-box.component";

export default function ViewAppointmentScreen() {
  const navigator = useNavigation<NativeStackNavigationProp<NavigationModel>>();
  const [appointments, setAppointments] = useState<AppointmentModel[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const renderItem: ListRenderItem<AppointmentModel> = useCallback(
    ({ item }) => (
      <AppointmentCard
        doctorEmployeeId={item.doctorEmployeeId}
        status={item.status}
        date={item.date}
        timeSlot={item.timeSlot}
        appointmentId={item.appointmentId}
        onAppointmentChange={fetchAppointments}
      />
    ),
    [],
  );

  const goToHome = () => {
    navigator.navigate("tabs", {
      screen: "appointment",
      params: {},
    });
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async (isLoadMore = false, searchText?: string) => {
    try {
      const patientId = await AsyncStorage.getItem("patientId");
      const currentPage = isLoadMore ? page + 1 : page;

      if (isLoadMore && currentPage > totalPages) return;
      if (isLoading) return;

      setIsLoading(true);

      const response = await getAppointmentsByPatientId(
        patientId ?? "",
        searchText ?? "",
        currentPage,
        limit,
      );

      setTotalPages(response.data.totalPages);
      setAppointments((prev) =>
        isLoadMore
          ? [...prev, ...(response.data.data as AppointmentModel[])]
          : (response.data.data as AppointmentModel[]),
      );

      setPage(currentPage);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      console.error(err);
    }
  };

  const onPageEnd = () => {
    if (isLoading || page >= totalPages) return;
    fetchAppointments(true);
  };

  const onSearch = (text: string) => {
    setPage(1);
    setAppointments([]);
    fetchAppointments(false, text);
  };

  return (
    <ImageBackground source={BgImage} resizeMode="cover" style={styles.wrapper}>
      <View style={styles.overlay}>
        <WelcomeTextContainer
          text1="View your,"
          text2="APPOINTMENT"
          text3="here."
          isHome={true}
        ></WelcomeTextContainer>

        <ProfileButton
          title="GO BACK"
          iconName="arrow-back-outline"
          onAction={goToHome}
        />

        <SearchBox placeholder="Search appointment" onChangeText={onSearch} />

        <View style={styles.container}>
          <FormHeader title="SCHEDULE" value="Your Appointments" />

          {appointments.length === 0 && (
            <Text style={[styles.noAppointmentsText, styles.text]}>
              No appointments scheduled.
            </Text>
          )}

          <FlatList
            data={appointments}
            keyExtractor={(item) => item.appointmentId}
            renderItem={renderItem}
            initialNumToRender={1}
            maxToRenderPerBatch={3}
            windowSize={3}
            onEndReached={onPageEnd}
            onEndReachedThreshold={0.3}
            ListFooterComponent={
              isLoading ? (
                <ActivityIndicator size="small" color="rgb(108, 19, 109)" />
              ) : null
            }
          ></FlatList>
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
  scrollView: {
    height: 400,
  },
  container: {
    flex: 1,
    borderRadius: 35,
    marginTop: 10,
    borderColor: "rgba(207, 75, 255, 0.2)",
    backgroundColor: "#f2f2f2",
    borderWidth: 1,
    paddingBottom: 20,
  },
  formHeader: {
    padding: 20,
    flexDirection: "row",
  },
  formHeaderIcon: {
    padding: 15,
    backgroundColor: "rgb(108, 19, 109)",
    borderRadius: 100,
  },
  formHeaderTextHolder: {
    flexDirection: "column",
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  formHeaderTitle: {
    fontSize: 10,
    lineHeight: 18,
    color: "#909090",
  },
  formHeaderValue: {
    fontSize: 18,
    lineHeight: 18,
    color: "#505050",
  },
  text: {
    fontFamily: "Sans",
  },
  noAppointmentsText: {
    color: "white",
    fontSize: 12,
    lineHeight: 12,
    textAlign: "center",
    backgroundColor: "rgb(75, 12, 67)",
    padding: 10,
  },
});

import { View, StyleSheet, Text, Alert } from "react-native";
import ProfileButton from "../profile/profile-button.component";
import { Ionicons } from "@expo/vector-icons";
import { UserModel } from "../../types/user.types";
import { useEffect, useState, memo } from "react";
import {
  editAppointmentStatus,
  getDoctorByEmployeeId,
} from "../../services/appointment.service";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { NavigationModel } from "../../types/navigation.types";
import { useNavigation } from "@react-navigation/native";

export const AppointmentCardComponent = (props: any) => {
  const navigator = useNavigation<NativeStackNavigationProp<NavigationModel>>();

  const [doctor, setDoctor] = useState<UserModel | null>(null);

  const fetchDoctor = async () => {
    const data = await getDoctorByEmployeeId(props.doctorEmployeeId);
    setDoctor(data);
  };

  const goToEdit = () => {
    navigator.navigate("editAppointment", {
      appointment: {
        appointmentId: props.appointmentId,
        patientId: props.patientId,
        doctorEmployeeId: props.doctorEmployeeId,
        date: props.date,
        timeSlot: props.timeSlot,
        status: props.status,
        createdByEmployeeId: "",
      },
    });
  };

  useEffect(() => {
    fetchDoctor();
  }, [props.doctorEmployeeId]);

  const editAppointmentStatusByPatient = async () => {
    Alert.alert(
      "Cancel Appointment",
      "Are you sure you want to cancel this appointment",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                const appointmentId: string = props.appointmentId;
                const payload = {
                  appointmentId,
                  status: "Cancelled",
                };
                await editAppointmentStatus(payload);
                props.onAppointmentChange?.();
                Alert.alert("Success", "Appointment Cancelled Successfully");
              } catch (err) {
                console.error(err);
              }
            })();
          },
        },
      ],
    );
  };

  return (
    <View style={styles.appointmentContainer}>
      <View style={styles.appointmentHeader}>
        <View style={styles.appointmentIconAndText}>
          <View style={styles.avatarIcon}>
            <Text style={[styles.avatarText, styles.text]}>
              {doctor?.name?.slice(0, 3).toUpperCase()}
            </Text>
          </View>

          <View style={styles.appointmentTextHolder}>
            <Text
              style={[styles.text, styles.doctorText]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {doctor?.name}
            </Text>
            <Text
              style={[styles.text, styles.doctorSubTitle]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {`${doctor?.specialization}`}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.appointmentStatus,
            props.status === "Booked" && styles.booked,
            props.status === "Cancelled" && styles.cancelled,
            props.status === "Completed" && styles.completed,
            props.status === "Pending" && styles.pending,
          ]}
        >
          <Text style={[styles.text, styles.appointmentStatusText]}>
            {props.status}
          </Text>
        </View>
      </View>

      <View style={styles.divider}></View>

      <View style={styles.appointmentFooter}>
        <View style={styles.scheduleHolder}>
          <Ionicons
            name="calendar-outline"
            style={styles.appointmentIcon}
            size={20}
          />
          <Text style={[styles.footerText, styles.text]}>
            {new Date(props.date).toDateString()}
          </Text>
          <Ionicons
            name="time-outline"
            style={styles.appointmentIcon}
            size={20}
          />
          <Text style={[styles.footerText, styles.text]}>{props.timeSlot}</Text>
        </View>

        <View>
          {props.status === "Booked" && (
            <ProfileButton
              iconName="create-outline"
              title="Edit"
              onAction={goToEdit}
            />
          )}
          {props.status === "Pending" && (
            <ProfileButton
              iconName="close-outline"
              title="Cancel"
              onAction={editAppointmentStatusByPatient}
            />
          )}
        </View>
      </View>
    </View>
  );
};

export const AppointmentCard = memo(AppointmentCardComponent);

const styles = StyleSheet.create({
  appointmentContainer: {
    margin: 20,
    backgroundColor: "rgba(210, 210, 210, 0.3)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(127, 27, 131, 0.2)",
    padding: 20,
  },
  avatarIcon: {
    backgroundColor: "rgb(108, 19, 109)",
    borderRadius: 100,
    height: 50,
    width: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgb(194, 80, 247,0.4)",
  },
  avatarText: {
    color: "rgba(205, 148, 255, 0.8)",
    fontSize: 14,
    lineHeight: 14,
  },
  doctorText: {
    color: "#232323",
    fontSize: 16,
    lineHeight: 16,
  },
  doctorSubTitle: {
    color: "#7b7b7b",
    fontSize: 12,
    lineHeight: 12,
  },
  appointmentStatus: {
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  booked: {
    backgroundColor: "rgb(15, 118, 16)",
    borderColor: "rgba(175, 255, 226, 0.6)",
  },
  cancelled: {
    backgroundColor: "rgb(112, 14, 14)",
    borderColor: "rgba(255, 215, 186, 0.6)",
  },
  completed: {
    backgroundColor: "rgb(33, 18, 107)",
    borderColor: "rgba(168, 168, 255, 0.6)",
  },
  pending: {
    backgroundColor: "rgb(117, 69, 14)",
    borderColor: "rgba(254, 255, 168, 0.6)",
  },
  appointmentStatusText: {
    color: "#f5f5f5",
    fontSize: 12,
    lineHeight: 12,
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  appointmentTextHolder: {
    flexDirection: "column",
    marginLeft: 10,
    justifyContent: "center",
  },
  appointmentIconAndText: {
    flexDirection: "row",
  },
  appointmentIcon: {
    color: "rgb(101, 26, 114)",
  },
  footerText: {
    fontSize: 12,
    color: "rgb(46, 46, 46)",
    lineHeight: 12,
    marginHorizontal: 10,
  },
  appointmentFooter: {
    flexDirection: "column",
  },
  scheduleHolder: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  text: {
    fontFamily: "Sans",
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "rgb(212, 212, 212)",
    marginVertical: 10,
  },
});

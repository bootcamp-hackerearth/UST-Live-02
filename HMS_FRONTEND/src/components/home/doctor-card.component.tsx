import { LinearGradient } from "expo-linear-gradient";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

export const DoctorCard = (props: any) => {
  return (
    <TouchableOpacity style={styles.doctorContainer}>
      <LinearGradient
        colors={["rgba(81, 14, 122, 0.9)", "rgb(79, 62, 67)"]}
        style={styles.doctorAvatar}
      >
        <Text style={[styles.text, styles.doctorPrefix]}>{props.prefix}</Text>
      </LinearGradient>
      <View style={styles.doctorDetails}>
        <Text style={[styles.text, styles.doctorName]}>{props.name}</Text>
        <Text style={[styles.text, styles.doctorDesignation]}>
          {props.designation}
        </Text>
      </View>
      <View style={styles.doctorFooter}>
        <Text style={[styles.text, styles.doctorDepartment]}>
          {props.specialization}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  doctorContainer: {
    height: 100,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    marginTop: 10,
    elevation: 5,
  },
  doctorAvatar: {
    flex: 1,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    padding: 8,
  },
  text: {
    fontFamily: "Sans",
  },
  doctorPrefix: {
    fontSize: 13,
    color: "white",
  },
  doctorDetails: {
    flex: 4,
    marginHorizontal: 10,
  },
  doctorName: {
    color: "#2d2d2d",
    fontSize: 16,
    lineHeight: 28,
  },
  doctorDesignation: {
    color: "#636363",
    fontSize: 12,
    lineHeight: 12,
  },
  doctorFooter: {
    flex: 2,
    backgroundColor: "rgba(170, 170, 170, 0.2)",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  doctorDepartment: {
    fontSize: 12,
    lineHeight: 12,
    color: "#8e8e8e",
    textAlign: "center",
  },
});

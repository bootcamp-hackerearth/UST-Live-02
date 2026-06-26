import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

const DoctorCardComponent = (props: any) => {
  return (
    <TouchableOpacity style={styles.doctorContainer} onPress={props.onPress}>
      <View
        style={styles.doctorAvatar}
      >
        <Text style={[styles.text, styles.doctorPrefix]}>{props.prefix}</Text>
      </View>
      <View style={styles.doctorDetails}>
        <Text style={[styles.text, styles.doctorName]}>{props.name}</Text>
        <Text style={[styles.text, styles.doctorDesignation]}>
          {props.designation}
        </Text>
      </View>
      <View style={styles.doctorFooter}>
        <Text style={[styles.text, styles.doctorSpecialization]}>
          {props.specialization}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export const DoctorCard = React.memo(DoctorCardComponent);

const styles = StyleSheet.create({
  doctorContainer: {
    backgroundColor: "rgb(236, 236, 236)",
    borderRadius: 10,
    flexDirection: "column",
    padding: 20,
    marginTop: 10,
    marginRight:10,
  },
  doctorAvatar: {
    height: 50,
    width: 50,
    backgroundColor: "#4c1c77",
    justifyContent: "center",
    alignItems: "center",
    borderRadius:100,
    elevation:3,
  },
  text: {
    fontFamily: "Sans",
  },
  doctorPrefix: {
    fontSize: 18,
    lineHeight: 18,
    color: "white",
  },
  doctorDetails: {
    flexDirection: "column",
    justifyContent: "center",
  },
  doctorName: {
    color: "#545454",
    fontSize: 16,
    lineHeight: 28,
  },
  doctorDesignation: {
    color: "#a6a6a6",
    fontSize: 12,
    lineHeight: 12,
  },
  doctorFooter: {
    width: "100%",
    backgroundColor: "rgba(170, 170, 170, 0.2)",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    padding: 10,
  },
  doctorSpecialization: {
    fontSize: 12,
    lineHeight: 12,
    color: "#8e8e8e",
    textAlign: "center",
  },
});

import React from "react";
import { View, Text, StyleSheet } from "react-native";

const DoctorCard = ({ doctor }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>
        Dr. {doctor.name}
      </Text>

      <Text style={styles.spec}>
        {doctor.specialization}
      </Text>
    </View>
  );
};

export default React.memo(DoctorCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    width: 220,
    padding: 20,
    borderRadius: 25,
    marginRight: 15,
    elevation: 3,
  },

  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1C2143",
  },

  spec: {
    marginTop: 10,
    color: "#6B46C1",
    fontWeight: "600",
  },
});
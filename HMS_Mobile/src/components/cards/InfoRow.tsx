import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";

interface Props {
  label: string;
  value: string;
}

export default function InfoRow({
  label,
  value,
}: Props) {

  return (

    <View style={styles.row}>

      <Text style={styles.label}>
        {label}
      </Text>

      <Text style={styles.value}>
        {value || "-"}
      </Text>

    </View>

  );
}

const styles =
  StyleSheet.create({

    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 16,
    },

    label: {
      color: "#64748B",
      fontSize: 14,
    },

    value: {
      color: "#0F172A",
      fontWeight: "600",
      flex: 1,
      textAlign: "right",
    },
  });
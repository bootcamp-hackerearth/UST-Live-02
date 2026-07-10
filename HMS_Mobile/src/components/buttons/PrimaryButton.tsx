import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
}

export default function PrimaryButton({
  title,
  onPress,
  loading = false,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.button, loading && styles.disabled]}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <View style={styles.loaderRow}>
          <ActivityIndicator color="#FFFFFF" size="small" />

          <Text style={styles.text}>Please Wait...</Text>
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={styles.text}>{title}</Text>

          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 58,
    borderRadius: 18,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#2563EB",
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 6,
  },
  disabled: {
    opacity: 0.8,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  loaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
    marginHorizontal: 8,
  },
});

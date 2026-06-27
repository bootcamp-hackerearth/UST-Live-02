import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  subtitle?: string;
};

function EmptyState({ title, subtitle }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

export default React.memo(EmptyState);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 80,
  },

  title: {
    color: "#0F172A",
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },

  subtitle: {
    color: "#64748B",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 22,
  },
});

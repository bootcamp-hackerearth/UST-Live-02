import React from "react";

import { StyleSheet, Text, View } from "react-native";

interface Props {
  title: string;
}

export default function EmptyState({ title }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 40,
    alignItems: "center",
  },

  text: {
    color: "#64748B",
    fontSize: 16,
  },
});

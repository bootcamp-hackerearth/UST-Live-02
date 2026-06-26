import React from "react";
import { StyleSheet, View } from "react-native";

function CardSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.lineLarge} />
      <View style={styles.lineMedium} />
      <View style={styles.lineSmall} />
    </View>
  );
}

export default React.memo(CardSkeleton);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#E2E8F0",
    borderRadius: 22,
    height: 132,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
  },

  lineLarge: {
    backgroundColor: "#CBD5E1",
    borderRadius: 8,
    height: 18,
    width: "70%",
  },

  lineMedium: {
    backgroundColor: "#CBD5E1",
    borderRadius: 8,
    height: 14,
    marginTop: 18,
    width: "52%",
  },

  lineSmall: {
    backgroundColor: "#CBD5E1",
    borderRadius: 8,
    height: 12,
    marginTop: 16,
    width: "36%",
  },
});

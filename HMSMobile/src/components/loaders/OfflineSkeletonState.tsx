import React from "react";
import { StyleSheet, Text, View } from "react-native";
import CardSkeleton from "./CardSkeleton";
import OfflineBanner from "../common/OfflineBanner";

type OfflineSkeletonStateProps = {
  readonly message?: string;
  readonly cards?: number;
};

export default function OfflineSkeletonState({
  message = "Trying to reconnect and load saved data.",
  cards = 3,
}: OfflineSkeletonStateProps) {
  const skeletonCardIds = Array.from(
    { length: cards },
    (_, cardNumber) => `offline-skeleton-card-${cardNumber + 1}`,
  );

  return (
    <View style={styles.container}>
      <OfflineBanner compact />
      <Text style={styles.message}>{message}</Text>
      {skeletonCardIds.map((cardId) => (
        <CardSkeleton key={cardId} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FC",
    padding: 20,
  },
  message: {
    color: "#64748B",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
});

import { StyleSheet } from "react-native";

export const changePasswordStyles =
  StyleSheet.create({
    keyboardView: {
      flex: 1,
      backgroundColor: "#F4F7FC",
    },

    scrollContainer: {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: 20,
      paddingVertical: 30,
    },

    card: {
      backgroundColor: "#FFFFFF",
      borderRadius: 18,
      padding: 24,
      elevation: 4,

      shadowColor: "#000000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 6,
    },

    logoCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: "#3157A4",
      alignSelf: "center",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 18,
    },

    logoText: {
      color: "#FFFFFF",
      fontSize: 22,
      fontWeight: "700",
    },

    title: {
      fontSize: 24,
      fontWeight: "700",
      color: "#1F2937",
      textAlign: "center",
      marginBottom: 8,
    },

    subtitle: {
      fontSize: 14,
      color: "#6B7280",
      textAlign: "center",
      lineHeight: 21,
      marginBottom: 20,
    },

    requirementsContainer: {
      backgroundColor: "#F4F7FC",
      borderRadius: 10,
      padding: 14,
      marginBottom: 20,
    },

    requirementsTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: "#374151",
      marginBottom: 6,
    },

    requirementText: {
      fontSize: 13,
      color: "#6B7280",
      lineHeight: 20,
    },

    formContainer: {
      gap: 14,
    },

    showPasswordText: {
      color: "#3157A4",
      fontSize: 14,
      fontWeight: "600",
    },
  });
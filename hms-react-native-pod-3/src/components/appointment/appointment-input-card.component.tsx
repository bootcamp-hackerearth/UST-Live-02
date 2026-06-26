import { Ionicons } from "@expo/vector-icons";
import { TextInput, View, Text, StyleSheet } from "react-native";

export const AppointmentInputCard = (props: any) => {
  return (
    <View style={styles.appointmentContainer}>
      <Text
        style={[styles.text, styles.appointmentTitle]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {props.title}
      </Text>
      <View
        style={[styles.appointmentHolder, props.isDisabled && styles.disabled]}
      >
        <Ionicons
          name={props.iconName}
          size={22}
          color={"#cfcfcf"}
          style={styles.appointmentIcon}
        />
        <TextInput
          value={props.value}
          style={styles.appointmentTextField}
          placeholderTextColor={"rgba(111, 111, 111, 0.8)"}
          onChangeText={props.getData}
          editable={!props.isDisabled}
          numberOfLines={1}
        ></TextInput>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  appointmentContainer: {
    padding: 20,
    flexDirection: "column",
  },
  appointmentHolder: {
    flexDirection: "row",
    backgroundColor: "rgb(222, 222, 222)",
    borderWidth: 1,
    borderColor: "rgba(83, 11, 107, 0.3)",
    borderRadius: 10,
    padding: 8,
  },
  disabled: {
    borderWidth: 2,
    backgroundColor: "rgba(255, 209, 209, 0.4)",
    borderColor: "rgba(255, 11, 11, 0.2)",
  },
  appointmentTitle: {
    color: "rgb(139, 139, 139)",
    fontSize: 12,
    lineHeight: 12,
    marginBottom: 6,
  },
  appointmentIcon: {
    backgroundColor: "rgb(108, 19, 109)",
    borderWidth: 1,
    borderColor: "rgba(198, 53, 255, 0.2)",
    borderRadius: 10,
    padding: 10,
  },
  appointmentTextField: {
    color: "rgb(39, 39, 39)",
    fontFamily: "Sans",
    fontSize: 14,
    lineHeight: 14,
    marginLeft: 10,
    flex: 1,
  },
  text: {
    fontFamily: "Sans",
  },
});

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { View, Text, StyleSheet } from "react-native";

export const ProfileCard = (props: any) => {
  return (
    <LinearGradient
      style={styles.profileHeader}
      colors={["rgba(81, 14, 122, 0.9)", "rgb(79, 62, 67)"]}
    >
      <LinearGradient
        style={styles.avatar}
        colors={["rgba(146, 39, 213, 0.9)", "rgb(79, 62, 67)"]}
      >
        <Text style={[styles.text, styles.textPrefix]}>{props.prefix}</Text>
      </LinearGradient>
      <View style={styles.doctorDetails}>
        <Text
          style={[styles.text, styles.doctorText]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {props.name}
        </Text>
        <Text
          style={[styles.text, styles.designationText]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {props.designation}
        </Text>
        <View style={styles.empIdBadge}>
          <Ionicons
            name="id-card-outline"
            size={17}
            color="rgba(255,255,255,0.5)"
          ></Ionicons>
          <Text
            style={[styles.empIdText, styles.text]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {props.id}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  profileHeader: {
    flexDirection: "row",
    padding: 15,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    marginTop: 30,
    marginHorizontal: 20,
    borderColor: "rgba(194, 27, 255, 0.1)",
    borderWidth: 1,
  },
  avatar: {
    height: 60,
    width: 60,
    padding: 5,
    margin: 20,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "black",
    elevation: 5,
  },
  text: {
    fontFamily: "Sans",
  },
  doctorDetails: {
    justifyContent: "center",
  },
  textPrefix: {
    color: "white",
    fontSize: 23,
    lineHeight: 32,
  },
  doctorText: {
    fontSize: 18,
    color: "white",
    lineHeight: 22,
  },
  empIdBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  empIdText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    lineHeight: 10,
    marginLeft: 10,
  },
  designationText: {
    fontSize: 13,
    flex: 0,
    color: "white",
    lineHeight: 16,
    backgroundColor: "rgba(255,255,255,0.3)",
    padding: 7,
    borderRadius: 8,
    marginVertical: 10,
    textAlign: "center",
    alignSelf: "flex-start",
  },
});

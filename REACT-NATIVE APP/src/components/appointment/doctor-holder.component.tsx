import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { View, StyleSheet } from "react-native";
import { UserModel } from "../../types/user.types";

type DoctorHolderProps = Readonly<{
  doctors: UserModel[];
  selectedDoctor: string;
  setDoctor: (value: string) => void;
}>;

export default function DoctorHolder({
  doctors,
  selectedDoctor,
  setDoctor,
}: DoctorHolderProps) {
  return (
    <View style={styles.dropdownHolder}>
      <Ionicons
        name="medkit-outline"
        color="#cfcfcf"
        size={22}
        style={styles.dropDownIcon}
      />
      <Picker
        style={styles.picker}
        dropdownIconColor="white"
        onValueChange={(value: string) => setDoctor(value)}
        selectedValue={selectedDoctor}
      >
        <Picker.Item label="Doctor" value=""/>
        {doctors.map((doctor: UserModel) => (
          <Picker.Item
            key={doctor.employeeCode}
            label={`${doctor.name} (${doctor.specialization})`}
            value={doctor.employeeCode}
          />
        ))}
      </Picker>
    </View>
  );
}

const styles = StyleSheet.create({
  dropdownHolder: {
    backgroundColor: "rgb(222, 222, 222)",
    borderWidth: 1,
    borderColor: "rgba(83, 11, 107, 0.3)",
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    margin: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  picker: {
    flex: 1,
    marginLeft: 3,
    color: "rgb(39, 39, 39)",
    fontFamily: "Sans",
  },
  dropDownIcon: {
    padding: 10,
    backgroundColor: "rgb(108, 19, 109)",
    borderWidth: 1,
    borderColor: "rgba(198, 53, 255, 0.2)",
    borderRadius: 10,
  },
});

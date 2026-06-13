import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";

import GlassCard from "../../src/components/cards/GlassCard";

import PrimaryButton from "../../src/components/buttons/PrimaryButton";

import TimeSlotSelector from "../../src/components/selectors/TimeSlotSelectors";
import {
  useEffect,
  useState,
} from "react";

import {
  useRoute,
} from "@react-navigation/native";
import { useNavigation}
from "@react-navigation/native";
import {
  minLength,
} from "../../src/utils/validators";

import DateTimePicker
from "@react-native-community/datetimepicker";

import {
  getAppointmentById,
  getAvailableSlots,
  updateMyAppointment,
} from "../../src/services/appointment.service";

export default function EditAppointment() {
    const navigation =
useNavigation<any>();  

const route =
  useRoute<any>();

const { id } =
  route.params;
  const [
    appointment,
    setAppointment,
  ] = useState<any>(null);

  const [
    appointmentDate,
    setAppointmentDate,
  ] = useState("");

  const [
    appointmentTime,
    setAppointmentTime,
  ] = useState("");

  const [
    symptoms,
    setSymptoms,
  ] = useState("");

  const [
    slots,
    setSlots,
  ] = useState<string[]>([]);
  const [errors,
setErrors] =
useState<any>({});

  const [
    showDatePicker,
    setShowDatePicker,
  ] = useState(false);

  useEffect(() => {

    loadAppointment();

  }, []);

  const loadAppointment =
    async () => {

      try {

        const response =
          await getAppointmentById(
            id as string
          );

        const data =
          response.data.data;

        setAppointment(
          data
        );

        setAppointmentDate(
          data.appointmentDate
            .split("T")[0]
        );

        setAppointmentTime(
          data.timeSlot
        );

        setSymptoms(
          data.symptoms?.[0] || ""
        );

      } catch {

        Alert.alert(
          "Failed to load appointment"
        );
      }
    };

  const loadSlots =
    async () => {

      try {

        const response =
          await getAvailableSlots(

            appointment
              .doctorEmployeeId
              ._id,

            appointmentDate
          );

        setSlots(
          response.data.data
        );

      } catch {

        Alert.alert(
          "Failed to load slots"
        );
      }
    };
const validateForm = () => {

  const newErrors:any = {};

  if (
    !appointmentDate
  ) {

    newErrors.appointmentDate =
      "Appointment date is required";

  }

  if (
    !appointmentTime
  ) {

    newErrors.appointmentTime =
      "Please select a slot";

  }

  if (
    symptoms &&
    !minLength(
      symptoms.trim(),
      5
    )
  ) {

    newErrors.symptoms =
      "Symptoms must contain at least 5 characters";

  }

  if (
    symptoms.length > 500
  ) {

    newErrors.symptoms =
      "Maximum 500 characters allowed";

  }

  setErrors(
    newErrors
  );

  return Object.keys(
    newErrors
  ).length === 0;
};
  const handleUpdate =
    async () => {

      try {

        await updateMyAppointment(

          id as string,

          {
            appointmentDate,

            appointmentTime,

            symptoms:
              symptoms
                ? [symptoms]
                : [],
          }
        );

        Alert.alert(

          "Success",

          "Appointment updated successfully",

          [
            {
              text: "OK",

              onPress: () =>
                navigation.goBack(),
            },
          ]
        );

      } catch (
        error: any
      ) {

        Alert.alert(

          "Failed",

          error?.response
            ?.data
            ?.message ||

          "Update failed"
        );
      }
    };

 if (!appointment) {

  return (

    <SafeAreaView
      style={styles.loadingContainer}
    >

      <Text
        style={styles.loadingText}
      >
        Loading Appointment...
      </Text>

    </SafeAreaView>

  );
}

  return (

<SafeAreaView
  style={styles.container}
>

<ScrollView
  showsVerticalScrollIndicator={false}
  contentContainerStyle={{
    paddingBottom: 40,
  }}
>

<Text style={styles.title}>
  Edit Appointment
</Text>

<Text style={styles.subtitle}>
  Update your appointment
  schedule and symptoms.
</Text>

<GlassCard>

<Text style={styles.section}>
  Doctor Information
</Text>

<View style={styles.doctorCard}>

<View style={styles.avatar}>

<Text style={styles.avatarText}>
  {
    appointment
      ?.doctorEmployeeId
      ?.name
      ?.charAt(0)
  }
</Text>

</View>

<View>

<Text style={styles.doctorName}>
  Dr. {
    appointment
      ?.doctorEmployeeId
      ?.name
  }
</Text>

<Text style={styles.doctorSubtitle}>
  Appointment Doctor
</Text>

</View>

</View>

</GlassCard>

<GlassCard>

<Text style={styles.section}>
  Appointment Date
</Text>

<TouchableOpacity
  style={styles.dateButton}
  onPress={() =>
    setShowDatePicker(
      true
    )
  }
>

<Text style={styles.dateText}>
  {appointmentDate}
</Text>

</TouchableOpacity>
{
errors.appointmentDate && (

<Text
style={{
color:"#EF4444",
fontSize:12,
marginTop:8,
}}
>
{errors.appointmentDate}
</Text>

)
}

{
showDatePicker && (

<DateTimePicker
  mode="date"
  value={
    new Date(
      appointmentDate
    )
  }
  minimumDate={
    new Date()
  }
  onChange={(
    event,
    selectedDate
  ) => {

    setShowDatePicker(
      false
    );

    if (
      selectedDate
    ) {

      const date =
        selectedDate
          .toISOString()
          .split("T")[0];

     setAppointmentDate(
  date
);

setErrors({
  ...errors,
  appointmentDate:"",
});
    }
  }}
/>

)
}

<TouchableOpacity
  style={styles.loadButton}
  onPress={loadSlots}
>

<Text
  style={
    styles.loadButtonText
  }
>
  Load Available Slots
</Text>

</TouchableOpacity>

</GlassCard>
{
slots.length > 0 && (

<GlassCard>

<Text style={styles.section}>
  Available Slots
</Text>

<TimeSlotSelector
  slots={slots}
  selectedSlot={
    appointmentTime
  }
  onSelect={(slot)=>{

setAppointmentTime(
slot
);

setErrors({
...errors,
appointmentTime:"",
});

}}
/>
{
errors.appointmentTime && (

<Text
style={{
color:"#EF4444",
fontSize:12,
marginTop:10,
}}
>
{errors.appointmentTime}
</Text>

)
}

</GlassCard>

)
}

<GlassCard>

<Text style={styles.section}>
  Symptoms
</Text>
<TextInput
value={symptoms}
onChangeText={(value)=>{

setSymptoms(value);

setErrors({
...errors,
symptoms:"",
});

}}
multiline
placeholder="Describe symptoms..."
placeholderTextColor="#94A3B8"
style={styles.textArea}
/>

{
errors.symptoms && (

<Text
style={{
color:"#EF4444",
fontSize:12,
marginTop:8,
}}
>
{errors.symptoms}
</Text>

)
}

</GlassCard>

<GlassCard>

<Text style={styles.section}>
  Appointment Summary
</Text>

<Text style={styles.summary}>
  Date: {appointmentDate}
</Text>

<Text style={styles.summary}>
  Time: {appointmentTime}
</Text>

</GlassCard>

<PrimaryButton
  title="Save Changes"
  onPress={
    handleUpdate
  }
/>

</ScrollView>

</SafeAreaView>

);
}

const styles =
StyleSheet.create({

container:{
flex:1,
backgroundColor:"#F4F7FC",
paddingHorizontal:20,
},

loadingContainer:{
flex:1,
justifyContent:"center",
alignItems:"center",
backgroundColor:"#F4F7FC",
},

loadingText:{
fontSize:16,
color:"#64748B",
},

title:{
fontSize:30,
fontWeight:"800",
color:"#0F172A",
marginTop:20,
},

subtitle:{
color:"#64748B",
marginTop:8,
marginBottom:25,
lineHeight:22,
},

section:{
fontSize:18,
fontWeight:"700",
marginBottom:16,
color:"#0F172A",
},

doctorCard:{
flexDirection:"row",
alignItems:"center",
},

avatar:{
width:60,
height:60,
borderRadius:30,
backgroundColor:"#2563EB",
justifyContent:"center",
alignItems:"center",
marginRight:14,
},

avatarText:{
color:"#FFFFFF",
fontSize:24,
fontWeight:"800",
},

doctorName:{
fontSize:17,
fontWeight:"700",
color:"#0F172A",
},

doctorSubtitle:{
marginTop:4,
color:"#64748B",
},

dateButton:{
height:56,
backgroundColor:"#FFFFFF",
borderRadius:16,
justifyContent:"center",
paddingHorizontal:16,
borderWidth:1,
borderColor:"#E2E8F0",
},

dateText:{
color:"#334155",
},

loadButton:{
backgroundColor:"#2563EB",
height:52,
borderRadius:16,
justifyContent:"center",
alignItems:"center",
marginTop:16,
},

loadButtonText:{
color:"#FFFFFF",
fontWeight:"700",
},

textArea:{
backgroundColor:"#FFFFFF",
borderRadius:16,
borderWidth:1,
borderColor:"#E2E8F0",
padding:16,
minHeight:120,
textAlignVertical:"top",
color:"#0F172A",
},

summary:{
fontSize:15,
color:"#334155",
marginBottom:10,
},

});
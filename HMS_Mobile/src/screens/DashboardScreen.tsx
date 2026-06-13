import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useEffect,
  useState,
} from "react";

import {
  useNavigation,
} from "@react-navigation/native";

import {
  getDashboard,
} from "../../src/services/patient.service";

import GlassCard from "../../src/components/cards/GlassCard";
import StatCard from "../../src/components/cards/StatCard";
import QuickActionCard from "../../src/components/cards/QuickActionCard";

export default function Dashboard() {
    const navigation =
useNavigation<any>();
const [refreshing,
setRefreshing] =
useState(false);
 const [dashboard,
setDashboard] =
useState<any>(null);
const onRefresh =
async () => {

setRefreshing(true);

await loadDashboard();

setRefreshing(false);

};
const [loading,
setLoading] =
useState(true);
  useEffect(() => {

    loadDashboard();

  }, []);

const loadDashboard =
async () => {

try {

setLoading(true);

const response =
await getDashboard();

setDashboard(
response.data.data
);

}
catch(error){

console.log(error);

}
finally{

setLoading(false);

}
};
if (loading) {

return (

<SafeAreaView
style={styles.container}
>

<View
style={{
padding:20,
}}
>

<GlassCard>
<Text>
Loading Dashboard...
</Text>
</GlassCard>

</View>

</SafeAreaView>

);

}

const hour = new Date().getHours();
let greeting = "Good Evening 🌙";
if (hour < 12) {
  greeting = "Good Morning 👋";
} else if (hour < 18) {
  greeting = "Good Afternoon ☀️";
}

 return (

<SafeAreaView
  style={styles.container}
>

<ScrollView
showsVerticalScrollIndicator={false}
refreshControl={
<RefreshControl
refreshing={
refreshing
}
onRefresh={
onRefresh
}
/>
}
>
<View style={styles.hero}>


<Text style={styles.greeting}>
 {greeting}
</Text>

<Text style={styles.name}>
  {dashboard?.patient?.firstName}
</Text>

<View style={styles.patientBadge}>
  <Text style={styles.badgeText}>
    ID:
    {" "}
    {
      dashboard?.patient?.patientId
    }
  </Text>
</View>

</View>

<Text style={styles.section}>
  Quick Actions
</Text>

<View style={styles.quickRow}>

<QuickActionCard
title="Book"
onPress={() =>
navigation.navigate(
"BookAppointment"
)}
/>

<QuickActionCard
title="Appointments"
onPress={() =>
navigation.navigate(
"Appointments"
)
}
/>

</View>

<View style={styles.quickRow}>

<QuickActionCard
title="Profile"
onPress={() =>
navigation.navigate(
"Profile"
)
}
/>

<QuickActionCard
title="Records"
onPress={() =>
Alert.alert(
"Coming Soon"
)
}
/>

</View>

<Text style={styles.section}>
  Appointment Summary
</Text>

<View
style={{
flexDirection:"row",
paddingHorizontal:14,
justifyContent:"space-between",
marginBottom:15,
}}
>

<StatCard
title="Pending"
value={
dashboard
?.appointmentSummary
?.pending || 0
}
/>

<StatCard
title="Booked"
value={
dashboard
?.appointmentSummary
?.booked || 0
}
/>

<StatCard
title="Completed"
value={
dashboard
?.appointmentSummary
?.completed || 0
}
/>

</View>
<GlassCard>

<Text style={styles.cardTitle}>
Upcoming Appointment
</Text>

{
dashboard?.upcomingAppointment
? (
<View>

<View
style={{
flexDirection:"row",
alignItems:"center",
marginBottom:15,
}}
>

<View
style={{
width:50,
height:50,
borderRadius:25,
backgroundColor:"#DBEAFE",
justifyContent:"center",
alignItems:"center",
marginRight:12,
}}
>

<Text
style={{
fontWeight:"800",
color:"#2563EB",
}}
>
DR
</Text>

</View>

<View>

<Text
style={{
fontWeight:"700",
fontSize:16,
}}
>
Dr. {
dashboard
?.upcomingAppointment
?.doctorEmployeeId
?.name
}
</Text>

<Text
style={{
color:"#64748B",
}}
>
Upcoming Consultation
</Text>

</View>

</View>

<Text style={styles.info}>
📅 {
dashboard
?.upcomingAppointment
?.appointmentDate
?.split("T")[0]
}
</Text>

<Text style={styles.info}>
🕐 {
dashboard
?.upcomingAppointment
?.timeSlot
}
</Text>

</View>
)
:
(
<Text style={styles.empty}>
No upcoming appointment
</Text>
)
}

</GlassCard>

<GlassCard>

<Text style={styles.cardTitle}>
Healthcare Journey
</Text>

<Text style={styles.journeyText}>
Stay on top of your
appointments and manage
your healthcare seamlessly.
</Text>

<TouchableOpacity
style={styles.bookButton}
onPress={() =>
navigation.navigate(
"BookAppointment"
)}
>

<Text style={styles.bookText}>
Book Appointment
</Text>

</TouchableOpacity>

</GlassCard>

</ScrollView>

</SafeAreaView>

);
}

const styles =
StyleSheet.create({

container:{
flex:1,
backgroundColor:"#F4F7FC",
},

hero:{
backgroundColor:"#2563EB",
padding:24,
borderBottomLeftRadius:30,
borderBottomRightRadius:30,
},

greeting:{
color:"#DBEAFE",
fontSize:16,
},

name:{
fontSize:30,
fontWeight:"800",
color:"#fff",
marginTop:5,
},

patientBadge:{
marginTop:12,
alignSelf:"flex-start",
backgroundColor:
"rgba(255,255,255,0.2)",
paddingHorizontal:12,
paddingVertical:6,
borderRadius:20,
},

badgeText:{
color:"#fff",
},

section:{
fontSize:18,
fontWeight:"700",
margin:20,
color:"#0F172A",
},

quickRow:{
flexDirection:"row",
paddingHorizontal:14,
},

statsRow:{
flexDirection:"row",
paddingHorizontal:14,
gap:10,
},

cardTitle:{
fontSize:18,
fontWeight:"700",
marginBottom:15,
},

info:{
fontSize:15,
marginBottom:8,
},

empty:{
color:"#64748B",
},

journeyText:{
color:"#64748B",
lineHeight:22,
},

bookButton:{
marginTop:20,
backgroundColor:"#2563EB",
padding:14,
borderRadius:14,
alignItems:"center",
},

bookText:{
color:"#fff",
fontWeight:"700",
},
});
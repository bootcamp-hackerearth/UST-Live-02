import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
RefreshControl,
} from "react-native";
import {
  SafeAreaView,
} from "react-native-safe-area-context";

import React,
{
  useState,
} from "react";
import {
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";

import {
  getAppointments,
} from "../../src/services/appointment.service";

import AppointmentCard
from "../../src/components/cards/AppointmentCard";

export default function Appointments() {

  const navigation =
    useNavigation<any>();
    const [refreshing,
setRefreshing] =
useState(false);

  const [appointments,
    setAppointments] =
    useState<any[]>([]);

  const [loading,
    setLoading] =
    useState(false);
    const [search,
setSearch] =
useState("");
const onRefresh =
async () => {

setRefreshing(true);

await loadAppointments();

setRefreshing(false);

};

const [selectedFilter,
setSelectedFilter] =
useState("ALL");

  useFocusEffect(

    React.useCallback(
      () => {

        loadAppointments();

      },
      []
    )
  );

  const loadAppointments =
    async () => {

      try {

        setLoading(true);

        const response =
          await getAppointments();

        setAppointments(
          response.data.data
        );

      } finally {

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

<Text>
Loading Appointments...
</Text>

</View>

</SafeAreaView>

);

}

  return (

    <SafeAreaView
      style={styles.container}
    >

      <View
        style={styles.header}
      >

        <Text
          style={styles.title}
        >
          My Appointments
        </Text>

        <Text
          style={
            styles.subtitle
          }
        >
          Manage and track
          your appointments.
        </Text>

      </View>

      <TouchableOpacity

        style={
          styles.bookButton
        }

        onPress={() =>
          navigation.navigate(
            "BookAppointment"
          )
        }
      >

        <Text
          style={
            styles.bookText
          }
        >
          + Book Appointment
        </Text>

      </TouchableOpacity>
<View
style={{
paddingHorizontal:20,
marginTop:18,
}}
>

<TextInput
placeholder="Search doctor..."
placeholderTextColor="#94A3B8"
value={search}
onChangeText={setSearch}
style={{
height:52,
backgroundColor:"#FFFFFF",
borderRadius:16,
paddingHorizontal:16,
borderWidth:1,
borderColor:"#E2E8F0",
}}
/>
<FlatList
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
horizontal
showsHorizontalScrollIndicator={false}
data={[
"ALL",
"PENDING",
"BOOKED",
"COMPLETED",
"CANCELLED",
]}
keyExtractor={(item)=>item}
contentContainerStyle={{
paddingHorizontal:20,
paddingTop:16,
}}
renderItem={({item})=>(

<TouchableOpacity
onPress={() =>
setSelectedFilter(
item
)
}
style={{
paddingHorizontal:16,
paddingVertical:10,
borderRadius:20,
marginRight:10,

backgroundColor:
selectedFilter === item
? "#2563EB"
: "#FFFFFF",

borderWidth:1,
borderColor:"#E2E8F0",
}}
>

<Text
style={{
fontWeight:"700",

color:
selectedFilter === item
? "#FFFFFF"
: "#334155",
}}
>
{item}
</Text>

</TouchableOpacity>

)}
/>

</View>

      <FlatList
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

        data={appointments}

        keyExtractor={
          item => item._id
        }

        contentContainerStyle={{
          padding: 20,
        }}

        ListEmptyComponent={

          <View
            style={
              styles.emptyContainer
            }
          >

            <Text
              style={
                styles.emptyTitle
              }
            >
            📅 No Appointments Yet
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              Start your healthcare
journey by booking
your first consultation.
            </Text>

          </View>

        }

        renderItem={({
          item,
        }) => (

          <AppointmentCard

            item={item}

            onPress={() =>
              navigation.navigate(
                "AppointmentDetail",
                {
                  id: item._id,
                }
              )
            }

          />

        )}
      />

    </SafeAreaView>

  );
}

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor:
        "#F4F7FC",
    },

    header: {
      paddingHorizontal: 20,
      paddingTop: 20,
    },

    title: {
      fontSize: 30,
      fontWeight: "800",
      color: "#0F172A",
    },

    subtitle: {
      color: "#64748B",
      marginTop: 8,
    },

    bookButton: {
      marginHorizontal: 20,
      marginTop: 20,

      backgroundColor:
        "#2563EB",

      height: 56,

      borderRadius: 18,

      justifyContent:
        "center",

      alignItems:
        "center",
    },

    bookText: {
      color: "#FFFFFF",
      fontWeight: "700",
      fontSize: 16,
    },

    emptyContainer: {
      alignItems: "center",
      marginTop: 100,
    },

    emptyTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: "#0F172A",
    },

    emptyText: {
      marginTop: 8,
      color: "#64748B",
      textAlign: "center",
    },
  });
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
} from "react-native";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigation,
} from "@react-navigation/native";

import {
  removeToken,
} from "../../src/storage/token.storage";

import {
  getProfile,
} from "../../src/services/patient.service";

import GlassCard from "../../src/components/cards/GlassCard";
import ProfileInfoCard from "../../src/components/cards/ProfileInfoCard";

export default function Profile() {

  const navigation =
    useNavigation<any>();
const [profile,
setProfile] =
useState<any>(null);

const [loading,
setLoading] =
useState(true);
  useEffect(() => {

    loadProfile();

  }, []);

const loadProfile =
async () => {

try {

setLoading(true);

const response =
await getProfile();

setProfile(
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

  const logout =
    async () => {

      await removeToken();

      navigation.reset({

        index: 0,

        routes: [
          {
            name: "Login",
          },
        ],
      });
    };
if (loading) {

return (

<SafeAreaView
style={styles.container}
>

<GlassCard>

<Text>
Loading Profile...
</Text>

</GlassCard>

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
    paddingBottom: 140,
  }}
>

        <View style={styles.header}>

          <View
            style={styles.avatar}
          >

            <Text
              style={
                styles.avatarText
              }
            >
              {
                profile?.firstName
                  ?.charAt(0)
              }
            </Text>

          </View>

          <Text
            style={
              styles.name
            }
          >
            {
              profile?.firstName
            }{" "}
            {
              profile?.lastName
            }
          </Text>

          <View
            style={
              styles.idBadge
            }
          >

            <Text
              style={
                styles.idText
              }
            >
              ID:
              {" "}
              {
                profile?.patientId
              }
            </Text>

          </View>

        </View>

        <Text
          style={
            styles.section
          }
        >
          Personal Information
        </Text>

        <ProfileInfoCard
          label="Email Address"
          value={
            profile?.email
          }
        />

        <ProfileInfoCard
          label="Phone Number"
          value={
            profile?.phone
          }
        />
        <GlassCard>

<Text
style={styles.cardTitle}
>
Medical Information
</Text>

<Text style={styles.info}>
Blood Group:
{" "}
{
profile?.bloodGroup ||
"Not Added"
}
</Text>

<Text style={styles.info}>
Gender:
{" "}
{
profile?.gender ||
"Not Added"
}
</Text>

<Text style={styles.info}>
Date Of Birth:
{" "}
{
profile?.dateOfBirth
?.split("T")[0] ||
"Not Added"
}
</Text>

</GlassCard>

        <GlassCard>

          <Text
            style={
              styles.cardTitle
            }
          >
            Healthcare ID
          </Text>

          <Text
            style={
              styles.cardValue
            }
          >
            {
              profile?.patientId
            }
          </Text>

          <Text
            style={
              styles.cardSubtext
            }
          >
            Registered Patient
          </Text>

        </GlassCard>

        <GlassCard>

          <Text
            style={
              styles.cardTitle
            }
          >
            Emergency Contact
          </Text>

          <Text style={styles.info}>
            Name:
            {" "}
            {
              profile?.emergencyContactName ||
              "Not Added"
            }
          </Text>

          <Text style={styles.info}>
            Phone:
            {" "}
            {
              profile?.emergencyContactPhone ||
              "Not Added"
            }
          </Text>

          <Text style={styles.info}>
            Relationship:
            {" "}
            {
              profile?.relationship ||
              "Not Added"
            }
          </Text>

        </GlassCard>

        <TouchableOpacity

          style={
            styles.editButton
          }

          onPress={() =>
            navigation.navigate(
              "EditProfile"
            )
          }
        >
          <Text
            style={
              styles.buttonText
            }
          >
            Edit Profile
          </Text>

        </TouchableOpacity>

        <TouchableOpacity

          style={
            styles.logoutButton
          }

          onPress={logout}
        >

          <Text
            style={
              styles.buttonText
            }
          >
            Logout
          </Text>

        </TouchableOpacity>

      </ScrollView>

    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor:
        "#F4F7FC",
      padding: 20,
    },

    header: {
      alignItems: "center",
      marginBottom: 30,
    },

    avatar: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor:
        "#2563EB",
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    avatarText: {
      color: "#fff",
      fontSize: 34,
      fontWeight: "800",
    },

  name:{
fontSize:26,
fontWeight:"800",
marginTop:15,
color:"#0F172A",
},
    idBadge: {
      backgroundColor:
        "#DBEAFE",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      marginTop: 10,
    },

    idText: {
      color: "#2563EB",
      fontWeight: "600",
    },

    section: {
      fontSize: 18,
      fontWeight: "700",
      color: "#0F172A",
      marginBottom: 15,
    },

    cardTitle: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 10,
    },

    cardValue: {
      fontSize: 22,
      fontWeight: "800",
      color: "#2563EB",
    },

    cardSubtext: {
      color: "#64748B",
      marginTop: 8,
    },

    editButton: {
      backgroundColor:
        "#2563EB",
      height: 56,
      borderRadius: 16,
      justifyContent:
        "center",
      alignItems:
        "center",
      marginTop: 25,
    },

    logoutButton: {
      backgroundColor:
        "#EF4444",
      height: 56,
      borderRadius: 16,
      justifyContent:
        "center",
      alignItems:
        "center",
      marginTop: 12,
      marginBottom: 40,
    },

    buttonText: {
      color: "#fff",
      fontWeight: "700",
      fontSize: 16,
    },
    info:{
fontSize:15,
color:"#334155",
marginBottom:10,
lineHeight:22,
},

  });
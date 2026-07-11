import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ColorValue } from 'react-native';


type TabIconProps = Readonly<{
  color: ColorValue;
  size: number;
}>;

const HomeTabIcon = ({ color, size }: TabIconProps) => {
  return <Ionicons name="home" color={color} size={size} />;
};

const ProfileTabIcon = ({ color, size }: TabIconProps) => {
  return <Ionicons name="person" color={color} size={size} />;
};

const AppointmentsTabIcon = ({ color, size }: TabIconProps) => {
  return <Ionicons name="calendar" color={color} size={size} />;
};
const HealthRecordsTabIcon = ({ color, size }: TabIconProps) => {
  return <Ionicons name="document-text" color={color} size={size} />;
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: 60,
          paddingBottom: 8,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: HomeTabIcon,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ProfileTabIcon,
        }}
      />

      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Appointments',
          tabBarIcon: AppointmentsTabIcon,
        }}
      />
      <Tabs.Screen
        name="health-records"
        options={{
          title: 'Records',
          tabBarIcon: HealthRecordsTabIcon,
        }}
      />
    </Tabs>
  );
}
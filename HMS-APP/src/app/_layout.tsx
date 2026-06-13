import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // contentStyle: {
        //     backgroundColor: '#D9E6FF',
        //   },
      }}
    />
  );
}
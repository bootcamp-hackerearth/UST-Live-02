import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';
import StackNavigator from './src/navigation/StackNavigator';
import { colors } from './src/theme';

const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.accent,
    background: colors.background,
    surface: colors.surface,
    outline: colors.border,
    error: colors.danger,
  },
};

export default function App() {
  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer>
        <StackNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}

import { NavigationContainer } from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import AppNavigator from "./src/navigation/AppNavigator";
import { navigationRef } from "./src/navigation/RootNavigation";
import AppToast from "./src/components/common/AppToast";
import AppConfirmDialog from "./src/components/common/AppConfirmDialog";
import AppDataRefreshManager from "./src/components/common/AppDataRefreshManager";
import { initializeGlobalErrorHandler } from "./src/utils/globalErrorHandler";
import { queryClient } from "./src/services/query-client";

initializeGlobalErrorHandler();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer ref={navigationRef}>
        <AppDataRefreshManager />
        <AppNavigator />
        <AppToast />
        <AppConfirmDialog />
      </NavigationContainer>
    </QueryClientProvider>
  );
}

import { createNavigationContainerRef } from "@react-navigation/native";

import { RootStackParamList } from "../types/navigation";

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export const navigate = <RouteName extends keyof RootStackParamList>(
  name: RouteName,
  params?: RootStackParamList[RouteName],
) => {
  if (navigationRef.isReady()) {
    (navigationRef.navigate as any)(name, params);
  }
};

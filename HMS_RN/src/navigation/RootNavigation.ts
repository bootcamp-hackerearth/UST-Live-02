/**
 * @file RootNavigation.ts
 * @overview Provides global navigation utilities.
 * @description This file exports a navigation reference (`navigationRef`) that can be used to dispatch navigation actions
 * from outside of React components (e.g., in services or interceptors). It also provides a utility function `resetToLogin`
 * to programmatically log the user out and reset the navigation stack to the Login screen.
 * @connections
 * - `App.tsx` -> Passes `navigationRef` to the `NavigationContainer`.
 * - `ErrorInterceptor.ts` (on token refresh failure) -> Calls `resetToLogin()` -> `navigationRef.reset()` -> Forces navigation to the 'Login' route.
 */
import { createNavigationContainerRef } from "@react-navigation/native";

export const navigationRef = createNavigationContainerRef<any>();

export function resetToLogin() {
    if (navigationRef.isReady()) {
        navigationRef.reset({
            index: 0,
            routes: [{ name: "Login" }],
        });
    }
}
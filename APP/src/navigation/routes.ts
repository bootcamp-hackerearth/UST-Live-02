export const ROUTES = {
  login: "Login",
  signup: "Signup",
  resetPassword: "ResetPassword", //nosonar
  dashboard: "Dashboard",
  profile: "Profile",
  appointments: "Appointments",
  bookAppointment: "BookAppointment",
} as const;

export type RouteName = (typeof ROUTES)[keyof typeof ROUTES];

export type AppNavigation = {
  navigate: (routeName: RouteName, params?: Record<string, unknown>) => void;
  replace: (routeName: RouteName) => void;
  reset: (state: { index: number; routes: Array<{ name: RouteName }> }) => void;
  goBack: () => void;
};

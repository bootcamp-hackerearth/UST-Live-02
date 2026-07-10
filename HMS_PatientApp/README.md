# HMS Patient App

**MediCare+** — the patient-facing mobile app for the Hospital Management
System. Built with Expo (React Native) and expo-router, it lets patients
register, book and manage appointments, and read their finalized medical
records. It talks to the [HMS Back End](../HMS_Back_end) patient API
(`/api/patient/*`).

## Tech stack

| Area          | Library                                 |
| ------------- | --------------------------------------- |
| Framework     | Expo `~56` + React Native `0.85`        |
| Language      | TypeScript                              |
| Routing       | expo-router (file-based)                |
| Server state  | @tanstack/react-query                   |
| Client state  | zustand                                 |
| Secure tokens | expo-secure-store                       |
| Navigation UI | react-native-screens, safe-area-context |

## Prerequisites

- Node.js and npm
- The Expo CLI (invoked via `npx expo ...`)
- A running [HMS Back End](../HMS_Back_end) reachable from the device/emulator
- Expo Go, an Android emulator, or an iOS simulator to run the app

## Getting started

```bash
# Install dependencies
npm install

# Start the Expo dev server
npm start            # = expo start
```

Then open the app on a device or emulator:

```bash
npm run android      # build & run on Android
npm run ios          # build & run on iOS
npm run web          # run in the browser
npm run lint         # expo lint (ESLint)
```

## Configuring the API

The API base URL is read from the `EXPO_PUBLIC_API_URL` environment variable in
`src/config/api.ts`, falling back to a local default. Set it in a `.env` file
(gitignored) — point it at your deployed backend for shared builds, or at your
machine's LAN IP when testing on a physical device via Expo Go (the phone can't
reach the dev machine's `localhost`).

The app's deep-link scheme is `hmsapp://` (see `app.json`), which must match the
backend's `PATIENT_APP_URL` so emailed password-reset/login links open the app.

## Architecture

```text
src/
├── app/                # expo-router routes (file = screen)
│   ├── _layout.tsx     # Root layout / providers
│   ├── index.tsx       # Landing
│   ├── login.tsx, register.tsx, forgot-password.tsx, reset-password.tsx, change-password.tsx
│   ├── book-appointment.tsx, edit-appointment.tsx, appointment-record.tsx
│   ├── medical-records.tsx, medical-record.tsx
│   └── profile.tsx
├── components/         # Reusable UI (appointment/, common/, medical-record/)
├── screens/            # Screen bodies with co-located styles/*.style.ts
├── services/           # apiClient + one service per resource, tokenStore, types
├── store/              # zustand stores (AuthStore, confirmModal, navGuard)
├── hooks/              # useGuardedRouter, useRefetchOnFocusIfStale, useUnsavedChanges
├── lib/                # react-query client + logger
├── constants/          # theme (Colors/Fonts/Spacing), messages
└── utils/              # alerts, format, validation
```

### Routing

File-based via **expo-router**: each `src/app/*.tsx` file is a route, and
`src/app/_layout.tsx` is the root layout. Navigation is guarded through
`hooks/useGuardedRouter` and the `navGuard` store so users can't leave forms with
unsaved changes.

### Data & auth

- **Server state** is fetched with `@tanstack/react-query` (client in
  `lib/queryClient.ts`); one service per resource under `services/`
  (`authService`, `appointmentService`, `medicalRecordService`, `patientService`)
  wraps `services/apiClient.ts`.
- **Auth tokens** are persisted with `expo-secure-store` via
  `services/tokenStore.ts`; auth state lives in the `AuthStore` zustand store.
  The backend issues a short-lived access token plus a rotating refresh token
  (sent in the request body for the mobile client).

### Theming

`src/constants/theme.ts` is the single source of truth for design tokens:

- `Colors` — light/dark palettes (green primary with semantic keys such as
  `surface`, `text`, `textSecondary`, `border`).
- `Fonts` — platform-specific font families.
- `Spacing` — a fixed spacing scale (`half`…`six`).

**Use these tokens — do not hardcode colors or spacing values.** `ThemeColor` is
the union of valid color keys. The intended visual design is documented in
[`UI_SPEC.md`](./UI_SPEC.md).

## App identity

Configured in `app.json`: name `hms-app`, scheme `hmsapp`, iOS bundle id
`com.chrisdepallan.hmsapp`, automatic light/dark UI style.

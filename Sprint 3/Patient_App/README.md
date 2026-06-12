# HMS Patient App
 
**MediCare+** — the patient-facing mobile app for the **Hospital Management
System (HMS)**, built with [Expo](https://expo.dev) and React Native. Patients
register, book and manage appointments, and maintain their profile. It talks to
the [HMS Back End](../HMS_Back_end) over the `/api/patient/*` routes (the
[HMS Front End](../HMS_Front_end) is the separate staff-facing web client).
 
## Features
 
- **Account** — self-register, log in, and forgot / reset / change password.
- **Appointments** — browse doctors and available slots, book, reschedule, view
  by status (booked / completed / cancelled), and cancel with a reason.
- **Profile** — view identity details (read-only) and edit contact, address and
  emergency-contact information.
 
## Tech stack
 
| Area            | Library                                            |
| --------------- | -------------------------------------------------- |
| Framework       | Expo SDK `~56`, React Native `0.85`, React `19`    |
| Language        | TypeScript (strict)                                |
| Routing         | expo-router (file-based, typed routes)             |
| State           | zustand                                            |
| Secure storage  | expo-secure-store (JWT)                            |
| Dates           | @react-native-community/datetimepicker             |
| Animation / UX  | react-native-reanimated, react-native-keyboard-controller |
| Icons           | @expo/vector-icons (Ionicons)                      |
 
## Prerequisites
 
- Node.js and npm
- The [Expo Go](https://expo.dev/go) app on a device, or an Android emulator /
  iOS simulator
- A reachable instance of the [HMS Back End](../HMS_Back_end) (default
  `http://localhost:5000/api`)
 
## Getting started
 
```bash
# Install dependencies
npm install
 
# Start the Expo dev server
npm start
```
 
From the dev-server output you can:
 
- scan the QR code with **Expo Go** on a physical device, or
- press `a` (Android emulator), `i` (iOS simulator), or `w` (web).
 
## Configuration
 
The backend base URL is resolved in [`src/config/api.ts`](src/config/api.ts):
 
```ts
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5000/api";
```
 
| Variable              | Description                          | Default                       |
| --------------------- | ------------------------------------ | ----------------------------- |
| `EXPO_PUBLIC_API_URL` | Overrides the backend base URL       | `http://localhost:5000/api`   |
 
> ⚠️ **Testing on a physical device (Expo Go):** `localhost` points at the phone,
> not your dev machine. Create a `.env` and set `EXPO_PUBLIC_API_URL` to your
> machine's LAN IP, e.g.:
>
> ```bash
> EXPO_PUBLIC_API_URL=http://192.168.1.100:5000/api
> ```
 
### App config (`app.json`)
 
| Field                    | Value                                                  |
| ------------------------ | ------------------------------------------------------ |
| name / slug              | `hms-app`                                               |
| scheme                   | `hmsapp`                                                |
| iOS bundle id / Android  | `com.chrisdepallan.hmsapp`                              |
| plugins                  | `expo-router`, `expo-splash-screen`, `@react-native-community/datetimepicker` |
| experiments              | `typedRoutes`, `reactCompiler`                          |
 
## Available scripts
 
| Script            | Action                                       |
| ----------------- | -------------------------------------------- |
| `npm start`       | `expo start` — start the dev server          |
| `npm run android` | `expo run:android` — build & run on Android  |
| `npm run ios`     | `expo run:ios` — build & run on iOS          |
| `npm run web`     | `expo start --web` — run in the browser      |
| `npm run lint`    | `expo lint`                                  |
 
## Project structure
 
```text
src/
├── app/                      # expo-router screens (file-based routing)
│   ├── _layout.tsx           # Root layout: restores auth, splash, keyboard provider
│   ├── index.tsx             # Home (logged in) or Landing (guest)
│   ├── login.tsx             # Login
│   ├── register.tsx          # Registration
│   ├── explore.tsx           # Appointments: list / book / reschedule / cancel
│   ├── profile.tsx           # Profile editor + change password / logout
│   ├── book-appointment.tsx  # Standalone booking screen
│   ├── edit-appointment.tsx  # Reschedule an appointment
│   ├── change-password.tsx   # Change password (authenticated)
│   ├── forgot-password.tsx   # Request a reset code
│   └── reset-password.tsx    # Reset password with the code
├── screens/                  # Screen implementations (auth, home, landing, patient)
├── components/               # UI: app-tabs, appointment cards/forms, common inputs/modals
├── store/                    # zustand stores: AuthStore, confirmModal, navGuard
├── services/                 # apiClient + auth / appointment / patient services + types
├── config/                   # api.ts (API_BASE_URL)
├── hooks/                    # useGuardedRouter, useUnsavedChanges
├── constants/                # messages, theme
└── utils/                    # alerts, format, validation
assets/                       # icons & splash images
```
 
## Routing & navigation
 
- [`src/app/_layout.tsx`](src/app/_layout.tsx) restores the session on launch via
  `useAuthStore.checkLoginStatus()` and renders the tab bar.
- [`src/components/app-tabs.tsx`](src/components/app-tabs.tsx) swaps between the
  **auth tabs** (Home / Login / Register) and **app tabs** (Home / Appointments /
  Profile) based on `isLoggedIn`.
- Protected routes (`/profile`, `/explore`) redirect to `/login` when logged out.
 
## Authentication
 
Auth state lives in [`src/store/AuthStore.ts`](src/store/AuthStore.ts) (zustand):
 
1. Login calls `POST /patient/auth/login` and receives a JWT.
2. `login(token)` stores the token in **expo-secure-store** (key `jwt`) and sets
   `isLoggedIn = true`.
3. [`src/services/apiClient.ts`](src/services/apiClient.ts) reads the token from
   secure store and attaches `Authorization: Bearer <token>` to authenticated
   requests, unwrapping the backend's standard `{ success, data, ... }` envelope.
4. `logout()` deletes the token; navigation guards send protected routes back to
   `/login`.
 
## Backend endpoints used
 
All relative to `API_BASE_URL`:
 
- **Auth** — `POST /patient/auth/register`, `/login`, `/forgot-password`,
  `/reset-password`; `PUT /patient/auth/change-password`
- **Profile** — `GET` / `PUT /patient/me`
- **Appointments** — `GET /patient/doctors`, `GET /patient/booked-slots`,
  `GET` / `POST /patient/appointments`, `PUT /patient/appointments/:id`,
  `PUT /patient/appointments/:id/cancel`
# HMS Front End

Angular 21 admin panel / dashboard for the **Hospital Management System (HMS)**.
It consumes the [HMS Back End](../HMS_Back_end) REST API and provides
node-and-permission-aware screens for managing employees, admins, patients,
appointments, medical records, sidebar nodes and per-designation permissions.

Built with modern Angular: **standalone components**, **zoneless change
detection**, **signals**, and **lazy-loaded routes**.

## Tech stack

| Area       | Library                        |
| ---------- | ------------------------------ |
| Framework  | Angular `^21.2`                |
| Language   | TypeScript `~5.9`              |
| Reactive   | RxJS `~7.8` + Angular signals  |
| Testing    | Vitest, jsdom                  |
| Formatting | Prettier                       |
| Tooling    | Angular CLI / `@angular/build` |

## Prerequisites

- Node.js and npm
- Angular CLI (use `npx ng ...`, or install globally)
- The HMS Back End running and reachable (default `http://localhost:5000/api`)

## Getting started

```bash
# Install dependencies
npm install

# Start the dev server
npm start            # = ng serve
```

Open `http://localhost:4200`. The app reloads on source changes.

> **CORS & cookies:** the backend only accepts requests from its configured
> `FRONTEND_URL` and issues an httpOnly refresh cookie, so keep `FRONTEND_URL`
> set to `http://localhost:4200` during local development.

## Available scripts

| Script          | Action                                 |
| --------------- | -------------------------------------- |
| `npm start`     | `ng serve` (dev server on :4200)       |
| `npm run build` | Production build to `dist/`            |
| `npm run watch` | Rebuild on change (development config) |
| `npm test`      | Run unit tests with Vitest             |
| `npm run ng`    | Raw Angular CLI passthrough            |

## Environment configuration

API endpoints are defined per build configuration in `src/environments/`:

| File                         | `production` | `apiUrl`                                  |
| ---------------------------- | ------------ | ----------------------------------------- |
| `environment.development.ts` | `false`      | `http://localhost:5000/api`               |
| `environment.ts`             | `true`       | `https://vanguard-hms-rho.vercel.app/api` |

`angular.json` performs a file replacement so production builds use
`environment.ts` while `ng serve` / development builds use
`environment.development.ts`. `proxy.conf.json` proxies `/api` to `:5000` during
`ng serve`. Import the API URL via
`import { environment } from '.../environments/environment'`.

## Architecture

```text
src/
├── app/
│   ├── app.config.ts       # Providers: router, http client + auth interceptor, zoneless CD
│   ├── app.routes.ts       # Route tree + route guards
│   ├── core/
│   │   ├── guards/         # auth, node-access, permission, role, must-change-password, unsaved-changes
│   │   ├── interceptors/   # authInterceptor (bearer + silent refresh + global errors)
│   │   ├── models/         # Typed API/domain models (incl. node, permission)
│   │   ├── services/       # AuthService + one service per resource (node, permission, dashboard, …)
│   │   └── validators/     # Reusable reactive-form validators
│   ├── features/
│   │   ├── auth/           # login, register, forgot/reset/change-password
│   │   ├── dashboard/      # overview, employees, admins, approvals, patients, appointments,
│   │   │                   #   medical-records, menu-nodes, permissions, profile
│   │   └── home/           # public landing page
│   └── shared/ui/          # Reusable UI: navbar, sidebar, modals, toast, slot pickers, inputs, etc.
├── environments/           # Per-config API URLs
├── main.ts                 # Bootstraps AppComponent with appConfig
└── styles.css
```

## Authentication & HTTP

- **Access token lives only in memory**; the **refresh token is an httpOnly
  cookie** set by the backend. Only the user object is cached in `localStorage`
  (`hms_user`), used to restore a session on reload.
- On startup `AuthService` silently calls `/refresh` (with credentials) to swap
  the refresh cookie for a fresh access token, then reloads `me`.
- `authInterceptor` (`core/interceptors/`) attaches
  `Authorization: Bearer <token>`, transparently refreshes on 401 (sharing a
  single in-flight `/refresh` so a burst of 401s triggers only one call), and
  handles errors globally (session clear on refresh failure, redirects, and a
  "cannot reach server" toast on status 0).
- `AuthService` (`core/services/auth.service.ts`) owns all auth flows and exposes
  both an observable (`currentUser$`) and a signal (`currentUserSignal`), plus
  accessors like `isAuthenticated()`, `getDesignation()`, `isSuperUser()` and
  `hasDesignation([...])`.

## Routing & access control

Routes are declared in `src/app/app.routes.ts` and lazy-load each component.
Authorization mirrors the backend's **node + permission** model rather than fixed
designation lists.

**Public:** `/` (home), `/login`, `/register`, `/forgot-password`,
`/reset-password`. **Gated:** `/change-password` (authenticated; also the forced
first-login flow).

**Dashboard tree** (`/dashboard/*`) — protected by `authGuard` +
`mustChangePasswordGuard`, then per-route by node/permission/owner guards:

| Route                                                                             | Guard                                                                   |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `overview`, `profile`                                                             | authenticated only                                                      |
| `employees`, `approvals`, `admins`, `patients`, `appointments`, `medical-records` | `nodeAccessGuard` (sidebar node membership)                             |
| `employees/create`, `employees/:code/edit`                                        | node + `permissionGuard(['CREATE_EMPLOYEE' / 'UPDATE_EMPLOYEE'])`       |
| `admins/create`, `admins/:code/edit`                                              | node + `permissionGuard(['CREATE_ADMIN' / 'UPDATE_ADMIN'])`             |
| `patients/create`                                                                 | node + `permissionGuard(['CREATE_PATIENT'])`                            |
| `appointments/book`, `.../edit`                                                   | node + `permissionGuard(['CREATE_APPOINTMENT' / 'UPDATE_APPOINTMENT'])` |
| `menu-nodes`, `permissions`                                                       | **OWNER only** (`ownerOnlyGuard`)                                       |

Guards (`core/guards/`):

- `authGuard` — requires a valid session, else redirects to `/login`.
- `nodeAccessGuard` — grants a module when the user's sidebar holds the node at
  `route.data.nodePath`; **OWNER always passes** (lockout safety hatch).
- `permissionGuard([...])` — requires at least one of the given permission codes.
- `role.guard` / `ownerOnlyGuard` — role-based gates (OWNER-only management pages).
- `mustChangePasswordGuard` — forces first-login users to set a new password.
- `unsavedChangesGuard` — `canDeactivate` guard warning on unsaved form changes.

## Features

- **Overview** — role-specific dashboard landing with stats from the dashboard API.
- **Employees / Admins** — list, create and edit staff and admin accounts.
- **Approvals** — review pending self-registrations and profile-change requests.
- **Patients** — register, search, view and edit patients.
- **Appointments** — book, list, view detail, edit, cancel, complete.
- **Medical records** — list and view clinical records (doctors auto-scoped to
  their own).
- **Menu nodes** — manage the sidebar navigation nodes (OWNER only).
- **Permissions** — grant/revoke permission codes per designation (OWNER only).
- **Profile** — view and request changes to your own profile.

## Build & deploy

```bash
npm run build
```

Outputs to `dist/`. The production build uses `environment.ts` (Vercel API URL)
and deploys to **Vercel** (`vercel.json`).

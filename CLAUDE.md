# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

A monorepo (no workspace tooling — each project has its own `package.json` and is installed/run independently) for a Hospital Management System with three apps that share one backend API:

| Directory        | Stack                                      | Role                                                        |
| ---------------- | ------------------------------------------ | ----------------------------------------------------------- |
| `HMS_Back_end/`  | Express 5 + MongoDB/Mongoose 9             | REST API. Source of truth for the domain, auth, permissions |
| `HMS_Front_end/` | Angular 21 (standalone, zoneless, signals) | Staff/admin web panel                                       |
| `PatientApp/`    | Expo (React Native) + expo-router          | Patient-facing mobile app                                   |

Each app has a detailed `README.md` kept current with the code (endpoints, auth model, env vars).

## Commands

Run these from inside the respective app directory.

**Backend** (`HMS_Back_end/`)

```bash
npm run dev            # nodemon auto-reload (dev)
npm start              # plain node (prod-style)
npm test               # all Jest tests (NODE_ENV=test, runInBand)
npm run test:unit      # tests/unit only
npm run test:integration
npm run test:coverage
npx jest path/to/file.test.js          # a single test file
npx jest -t "name of the test case"    # a single test by name
npm run seed:all       # re-run seeders manually
```

> Tests run with `NODE_ENV=test`. A `tests/` directory may not exist yet — the scripts point at `tests/unit` and `tests/integration`.
> `postinstall` runs `seed:all`, which needs a reachable `MONGO_URI`; without one, `npm install` still completes but seeding logs an error.

**Frontend** (`HMS_Front_end/`)

```bash
npm start              # ng serve (dev server)
npm run build          # prod build to dist/Admin-Panel/browser (uses environment.ts)
npm run watch          # rebuild on change (development config)
npm test               # Vitest + jsdom
```

**PatientApp** (`PatientApp/`)

```bash
npm start              # expo start
npm run android / ios / web
npm run lint           # expo lint (ESLint)
```

## Backend architecture

Entry point: `src/server.js` (validate env → connect DB → sync indexes → seed → listen), run under **pm2** (`healthcare-api`) in production on EC2. It imports `src/app.js`, which wires all middleware and mounts every router under `/api/*`.

**Cross-cutting conventions — follow these when adding endpoints:**

- **Response envelope.** Every 2xx goes through `sendSuccess(res, statusCode, message, data)` (`utils/apiResponse.js`) → `{ success, statusCode, message, data }`. Never `res.json(...)` a bare payload.
- **Errors.** Throw `new AppError(statusCode, message, errors?, code?)` (`utils/AppError.js`) from anywhere — controllers are plain `async` functions with **no try/catch** around the request flow. Express 5 forwards rejected promises to the global `errorHandler` (`middlewares/errorHandler.js`), which also normalizes Mongoose `ValidationError`/`CastError`, duplicate-key (11000), and bad JSON into the `{ success:false, statusCode, message, errors?, code? }` envelope. `notFound` + `errorHandler` are the last two middlewares and must stay last.
- **Constants, not literals.** Status codes come from `constants/statusCodes.js` (`STATUS.*`), user-facing strings from `constants/messages.js` (`MESSAGES.*`, some are functions), and domain enums/mappings from `constants/domain.js` (designations, departments, department→designation map, drug administration taxonomy, owner-only paths). Reuse these rather than inlining.
- **Time.** `server.js` pins `process.env.TZ` to `Asia/Kolkata` so all `Date` math is hospital-local. Keep date/slot logic TZ-aware.

**Authorization is layered — three independent mechanisms:**

1. `authMiddleware` verifies the JWT and sets `req.user` (roles). `optionalAuthMiddleware` for routes that behave differently when signed in.
2. `authorizeRoles(...)` / `authorizeDesignations(...)` — coarse role/designation gates.
3. `requirePermission(codes, requireAll?)` (`middlewares/requirePermission.js`) — fine-grained, DB-backed permission codes resolved per **designation** and served from `permissionCache`. Also exposes `hasPermission(req, code)` for in-controller branching. **`OWNER` bypasses all permission checks.** Permissions/nodes are seeded (`seedPermissions`, `seedNodes`) and cached (`permissionCache`, `nodeAccessCache`) — mutating them should invalidate the relevant cache.

**Two separate auth domains** (`utils/tokenService.js`): staff/employee and `PATIENT` tokens are signed with **different secrets** (`JWT_SECRET` vs `JWT_PATIENT_SECRET`) so a patient token can't be verified as staff. Access tokens are short-lived stateless JWTs; **refresh tokens are opaque, stored only as sha256 hashes** (`RefreshTokens` model), rotated on use with theft detection (reused token → whole family revoked). Staff refresh token rides an httpOnly cookie (`refreshCookie.js`); password change/reset revokes all sessions for the subject. Patient-facing routes are mounted under `/api/patient/*` (`patientAuth*`, `patientSelf*`) and guarded by `patientAuthMiddleware`.

**Data & IDs.** Mongoose models in `src/models/`. Several mint sequential human-readable IDs via a shared `Counter` (`EMP-000001`, `UHID-000001`, `APT-000001`). Soft delete is a reusable `softDeletePlugin`; `syncIndexes` on boot drops legacy unique indexes that soft-delete relaxes. `recordAudit` writes to `AuditLogs` for security-relevant actions.

**Directory roles:** `controllers/` (handlers), `routes/` (one router per resource), `middlewares/`, `validators/` (express-validator rule sets, checked by `middlewares/validate.js`), `utils/` (seeders, email, token/permission services, builders, pagination, appointment/slot helpers).

## Frontend architecture (HMS_Front_end)

Modern Angular: **standalone components, zoneless change detection, signals, lazy-loaded routes**. `app.config.ts` provides the router, http client with `authInterceptor`, and zoneless CD; `app.routes.ts` is the route tree with guards.

- **Auth.** Access token lives **only in memory**; the refresh token is an **httpOnly cookie** set by the backend. Only the user object is cached in `localStorage` (`hms_user`) to restore a session on reload. `AuthService` (`core/services/auth.service.ts`) silently calls `/refresh` on startup, owns all auth flows, and exposes both an observable (`currentUser$`) and a signal (`currentUserSignal`), plus `isAuthenticated()`, `getDesignation()`, `isSuperUser()`, `hasDesignation([...])`.
- **HTTP.** `authInterceptor` attaches the bearer token, transparently refreshes on 401 (single shared in-flight `/refresh` so a burst of 401s triggers one call), and handles errors globally (session clear on refresh failure, redirect, and a "cannot reach server" toast on status 0).
- **Guards** (`core/guards/`): access mirrors the backend **node + permission** model. `authGuard`, `nodeAccessGuard` (module access by sidebar node at `route.data.nodePath`; **OWNER always passes**), `permissionGuard([...])` (requires ≥1 permission code), `role.guard`/`ownerOnlyGuard` (OWNER-only pages: `menu-nodes`, `permissions`), `mustChangePasswordGuard`, `unsavedChangesGuard` (`canDeactivate`).
- **Structure:** `core/` (guards, interceptors, models, one service per resource, validators), `features/` (auth, dashboard/\*, home), `shared/ui/` (reusable navbar, sidebar, modals, toast, slot pickers, inputs).
- **API URL** comes from `src/environments/` via an `angular.json` file replacement; both configs use a same-origin `/api` base (keeps the refresh cookie first-party). `proxy.conf.json` proxies `/api` to the backend during `ng serve`; in production Nginx serves the built app and reverse-proxies `/api` to the backend. Import from `environments/environment`.
- Prettier: `printWidth: 100`, `singleQuote: true` (HTML uses the `angular` parser).

## PatientApp architecture

Expo Router file-based routing: screens in `src/app/*.tsx` are routes (`login`, `register`, `book-appointment`, `medical-records`, `profile`, etc.); `src/app/_layout.tsx` is the root layout. Deep-link scheme is `hmsapp://` (matches the backend's `PATIENT_APP_URL` for emailed login links).

- **State/data:** `@tanstack/react-query` (client in `lib/queryClient.ts`) for server state; `zustand` stores in `src/store/` (`AuthStore`, `confirmModal`, `navGuard`) for local state.
- **API:** `services/apiClient.ts` + one service per resource (`authService`, `appointmentService`, `medicalRecordService`, `patientService`); base URL in `config/api.ts`. Tokens persisted via `expo-secure-store` (`services/tokenStore.ts`).
- **Theming:** `src/constants/theme.ts` exports `Colors` (light/dark, green primary palette with semantic keys like `surface`/`text`/`border`), `Fonts`, and a `Spacing` scale. **Use these tokens — do not hardcode colors or spacing.** `ThemeColor` is the union of valid color keys.
- **Layout:** screens split into `src/screens/*` with co-located `styles/*.style.ts`; shared pieces in `src/components/` (grouped: `appointment/`, `common/`, `medical-record/`).

## Conventions across all three apps

- The backend is the single source of truth for roles/designations/permissions; frontend guards and the app must mirror, not redefine, backend authorization.
- Both client apps center on the same domain flows: auth (login/register/forgot/reset/change-password), appointments, medical records, and profile — mirror existing service/screen patterns when extending them.
- Deployment is to **EC2** via a GitHub Actions workflow (`.github/workflows/deploy.yml`, on push to `feature/Ashbin`): it SSHes to the instance, runs the backend under **pm2** (`healthcare-api`) and builds the Angular app, which **Nginx** serves while reverse-proxying `/api` to the backend.
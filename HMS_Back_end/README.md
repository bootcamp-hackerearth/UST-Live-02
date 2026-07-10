# HMS Back End

REST API for a **Hospital Management System (HMS)**. Built with Express 5 and
MongoDB (Mongoose), it provides staff and patient authentication, a
node-plus-permission authorization model, employee and patient management,
appointment scheduling, medical records, an approval-driven profile-change
workflow, audit logging and transactional email.

It backs two clients: the [HMS Front End](../HMS_Front_end) (Angular staff panel)
and the [PatientApp](../PatientApp) (Expo mobile app).

## Tech stack

| Area           | Library                          |
| -------------- | -------------------------------- |
| Runtime        | Node.js                          |
| Web framework  | Express `^5`                     |
| Database / ODM | MongoDB + Mongoose `^9`          |
| Auth           | jsonwebtoken (JWT), bcryptjs     |
| Validation     | express-validator                |
| Security       | helmet, cors, express-rate-limit |
| Logging        | morgan                           |
| Email          | axios (Brevo HTTP API)           |
| Testing        | Jest, Supertest                  |

## Prerequisites

- Node.js and npm
- A reachable MongoDB instance — local (`mongodb://localhost:27017/hms`) or MongoDB Atlas

## Getting started

```bash
# 1. Install dependencies.
#    NOTE: the "postinstall" hook runs `npm run seed:all`, which needs a
#    reachable MONGO_URI. Create your .env first (see below) or expect the
#    seeding step to fail (install itself still completes).
npm install

# 2. Create a .env file in the project root (see "Environment variables").

# 3. Run the server.
npm run dev     # nodemon (auto-reload) — development
npm start       # plain node — production-style
```

On boot, `src/server.js` runs in order: **validate env → connect DB → sync
indexes → seed → listen**. Env validation is fatal (the server refuses to start
with missing/weak secrets); index sync and seeding are non-fatal.

The server listens on `PORT` (default **5000**). Quick health checks:

- `GET /` → `{ success, message: "API running" }`
- `GET /health` → `{ status: "UP", timestamp }`
- `GET /api/db-status` → MongoDB connection state

## Environment variables

Create a `.env` file in the project root. **Use your own values — never commit
real secrets.** `.env` is gitignored.

`validateEnv` (`src/config/validateEnv.js`) requires the variables marked
**Required** below and rejects `JWT_SECRET` / `JWT_PATIENT_SECRET` shorter than
**32 characters**.

| Variable                     | Required | Description                                            | Example                         |
| ---------------------------- | -------- | ------------------------------------------------------ | ------------------------------- |
| `MONGO_URI`                  | yes      | MongoDB connection string                              | `mongodb://localhost:27017/hms` |
| `JWT_SECRET`                 | yes      | Secret for staff/employee access tokens (≥32 chars)    | `<long-random-string>`          |
| `JWT_PATIENT_SECRET`         | yes      | Secret for patient access tokens (≥32 chars)           | `<different-long-random>`       |
| `JWT_EXPIRES_IN`             | yes      | Access-token lifetime                                  | `15m`                           |
| `REFRESH_TOKEN_EXPIRES_DAYS` | yes      | Refresh-token lifetime in days                         | `30`                            |
| `FRONTEND_URL`               | no       | Allowed CORS origin (the Angular app); enables cookies | `http://localhost:4200`         |
| `PATIENT_APP_URL`            | no       | Patient app deep-link base for emailed links           | `hmsapp://`                     |
| `PORT`                       | no       | Port the API listens on (default 5000)                 | `5000`                          |
| `TZ`                         | no       | Overrides the default `Asia/Kolkata` timezone          | `Asia/Kolkata`                  |
| `BREVO_API_KEY`              | no       | Brevo (Sendinblue) API key for transactional email     | `<your-brevo-key>`              |
| `EMAIL_USER`                 | no       | Sender email address                                   | `no-reply@example.com`          |
| `OWNER_PASS`                 | no       | Password for the auto-seeded OWNER account             | `<strong-password>`             |

> **Timezone:** `server.js` pins `process.env.TZ` to `Asia/Kolkata` unless
> overridden, so all appointment/slot date math is hospital-local.

## Seeding & default login

Seeders run automatically on `postinstall`, on server startup (non-fatal), and
manually:

```bash
npm run seed:all
```

Seeding creates the sidebar navigation **nodes**, the **permission** catalog per
designation, and a single **OWNER** account:

| Field    | Value                                |
| -------- | ------------------------------------ |
| Username | `owner`                              |
| Email    | `owner@hospital.com`                 |
| Password | value of `OWNER_PASS` in your `.env` |

The OWNER is seeded with `mustChangePassword: false`. Staff/admin accounts
created through the app are issued a temporary password and flagged to change it
on first login.

## Authorization model

Access is layered from three independent mechanisms. **`OWNER` bypasses node and
permission checks entirely** (a lockout safety hatch).

1. **Authentication** — `authMiddleware` verifies the staff JWT and sets
   `req.user`; `patientAuthMiddleware` does the same for patient tokens;
   `optionalAuthMiddleware` attaches identity when present but does not require it.
2. **Node access** — `authorizeNode("/dashboard/<x>")` gates a whole module by
   whether the caller's designation is granted that sidebar **node**.
3. **Permissions** — `requirePermission(codes, requireAll?)` checks fine-grained
   permission codes resolved per designation and served from `permissionCache`.
   `hasPermission(req, code)` is the in-controller variant for branch logic.

Coarse role/designation gates (`authorizeRoles(...)`,
`authorizeDesignations(...)`) still guard OWNER/ADMIN-only management routes.

### Roles & designations

- **Roles** (on the `User`): `OWNER`, `ADMIN`, `STAFF`.
- **Staff designations**: `DOCTOR`, `RECEPTIONIST`, `CASHIER`, `NURSE`,
  `LAB_TECH`, `PHARMACIST`. `OWNER` and `ADMIN` are restricted roles created
  through dedicated flows (never self-registerable).

Domain constants live in `src/constants/domain.js` (department →
designation map, medical/specialization designations, drug-administration
taxonomy, owner-only and admin-max node paths):

| Department       | Designations   |
| ---------------- | -------------- |
| `OPD`            | DOCTOR, NURSE  |
| `IPD`            | DOCTOR, NURSE  |
| `Lab`            | LAB_TECH       |
| `Pharmacy`       | PHARMACIST     |
| `Reception`      | RECEPTIONIST   |
| `Billing`        | CASHIER        |
| `Administration` | (admins/owner) |

- **Medical registration number** required for `DOCTOR`, `NURSE`, `PHARMACIST`.
- **Specialization** applies to `DOCTOR`, `LAB_TECH`.

## Authentication & tokens

Two separate token domains, signed with **different secrets** so a patient token
cannot be verified as staff (`src/utils/tokenService.js`):

- **Access tokens** — short-lived stateless JWTs sent as `Authorization: Bearer <jwt>`.
- **Refresh tokens** — opaque random strings, stored **only as sha256 hashes**
  (`RefreshTokens` model), rotated on every use with reuse/theft detection (a
  replayed token revokes the whole token family). Staff refresh tokens ride an
  **httpOnly cookie** (`refreshCookie.js`); patient clients send the refresh
  token in the request body. Password change/reset revokes all sessions for the
  subject.

`POST /api/auth/refresh` and `POST /api/patient/auth/refresh` mint a new access
token from a valid refresh token.

## Conventions (follow when adding endpoints)

- **Success envelope** — every 2xx goes through
  `sendSuccess(res, statusCode, message, data)` (`utils/apiResponse.js`) →
  `{ success, statusCode, message, data }`. Never return a bare payload.
- **Errors** — throw `new AppError(statusCode, message, errors?, code?)` from
  anywhere. Controllers are plain `async` functions with **no try/catch** around
  the request flow; Express 5 forwards rejections to the global `errorHandler`,
  which also normalizes Mongoose `ValidationError`/`CastError`, duplicate-key
  (11000) and bad JSON. `notFound` + `errorHandler` stay last in `app.js`.
- **Constants** — status codes from `constants/statusCodes.js` (`STATUS.*`),
  user-facing strings from `constants/messages.js` (`MESSAGES.*`, some are
  functions), domain enums from `constants/domain.js`. Do not inline literals.
- **Rate limiting** — `rateLimiters.js` throttles login (10 / 15 min) and
  password-reset (5 / 15 min) on both staff and patient auth.

## API reference

Base paths are mounted in `src/app.js`; all paths are relative to the server
root (e.g. `POST /api/auth/login`).

### Public / health

| Method | Path             | Purpose                  |
| ------ | ---------------- | ------------------------ |
| GET    | `/`              | Liveness check           |
| GET    | `/health`        | Uptime probe             |
| GET    | `/api/db-status` | MongoDB connection state |

### `/api/auth` — staff

| Method | Path               | Auth     | Purpose                                        |
| ------ | ------------------ | -------- | ---------------------------------------------- |
| POST   | `/login`           | —        | Authenticate (rate-limited)                    |
| POST   | `/self-register`   | —        | Staff self-registration (pending approval)     |
| PUT    | `/change-password` | Bearer   | Change own password                            |
| POST   | `/forgot-password` | —        | Request a reset token via email                |
| POST   | `/reset-password`  | —        | Reset password using the token                 |
| POST   | `/refresh`         | Cookie   | Exchange refresh cookie for a new access token |
| POST   | `/logout`          | Optional | Revoke refresh token + clear cookie            |
| GET    | `/me`              | Bearer   | Current authenticated user                     |

### `/api/admin` — OWNER, ADMIN

| Method | Path                                 | Purpose                           |
| ------ | ------------------------------------ | --------------------------------- |
| POST   | `/create-employee`                   | Create a staff employee + account |
| GET    | `/employees`                         | List employees                    |
| GET    | `/employees/:employeeCode`           | Get one employee                  |
| GET    | `/pending-employees`                 | List self-registered, pending     |
| PUT    | `/approve-employee/:employeeCode`    | Approve a pending employee        |
| PUT    | `/reject-employee/:employeeCode`     | Reject a pending employee         |
| PUT    | `/update-employee/:employeeCode`     | Update an employee                |
| DELETE | `/delete-employee/:employeeCode`     | Delete an employee + account      |
| GET    | `/audit-logs`                        | Read audit log                    |
| GET    | `/profile-change-requests`           | List pending profile changes      |
| PUT    | `/approve-profile-change/:requestId` | Approve a profile change          |
| PUT    | `/reject-profile-change/:requestId`  | Reject a profile change           |

### `/api/owner` — OWNER only

| Method | Path                          | Purpose         |
| ------ | ----------------------------- | --------------- |
| POST   | `/create-admin`               | Create an ADMIN |
| GET    | `/admins`                     | List admins     |
| PUT    | `/update-admin/:employeeCode` | Update an admin |
| DELETE | `/delete-admin/:employeeCode` | Delete an admin |

### `/api/patients` — node `/dashboard/patients` + permissions

| Method | Path              | Permission       | Purpose               |
| ------ | ----------------- | ---------------- | --------------------- |
| POST   | `/create-patient` | `CREATE_PATIENT` | Register a patient    |
| GET    | `/search`         | node view        | Search patients       |
| GET    | `/`               | node view        | List patients         |
| GET    | `/:UHID`          | node view        | Get a patient by UHID |
| PUT    | `/:UHID`          | `UPDATE_PATIENT` | Update a patient      |
| DELETE | `/:UHID`          | `DELETE_PATIENT` | Delete a patient      |

### `/api/appointments` — node `/dashboard/appointments` + permissions

| Method | Path                         | Permission                                  | Purpose                   |
| ------ | ---------------------------- | ------------------------------------------- | ------------------------- |
| POST   | `/create-appointment`        | `CREATE_APPOINTMENT`                        | Book an appointment       |
| GET    | `/my`                        | `VIEW_MY_APPOINTMENTS`                      | Caller's own appointments |
| GET    | `/booked-slots`              | `CREATE_APPOINTMENT` / `UPDATE_APPOINTMENT` | Slots already booked      |
| GET    | `/`                          | `VIEW_ALL/MY_APPOINTMENTS`                  | List appointments         |
| GET    | `/:appointmentId`            | `VIEW_ALL/MY_APPOINTMENTS`                  | Appointment detail        |
| PUT    | `/:appointmentId`            | `UPDATE_APPOINTMENT`                        | Reschedule / update       |
| PUT    | `/:appointmentId/cancel`     | `CANCEL_APPOINTMENT`                        | Cancel (with reason)      |
| PUT    | `/:appointmentId/unattended` | `MARK_APPOINTMENT_UNATTENDED`               | Mark patient unattended   |

### `/api/medical-records` — node `/dashboard/medical-records` + permissions

| Method | Path                             | Permission                                                           | Purpose                            |
| ------ | -------------------------------- | -------------------------------------------------------------------- | ---------------------------------- |
| POST   | `/`                              | `CREATE_MEDICAL_RECORD_DRAFT` / `CREATE_AND_FINALIZE_MEDICAL_RECORD` | Create record (draft or finalized) |
| GET    | `/`                              | `VIEW_ALL/MY_MEDICAL_RECORDS`                                        | List/search (my-scope sees own)    |
| GET    | `/by-appointment/:appointmentId` | `VIEW_ALL/MY_MEDICAL_RECORDS`                                        | Record for an appointment          |
| GET    | `/:medicalRecordId`              | `VIEW_ALL/MY_MEDICAL_RECORDS`                                        | Record detail                      |
| PUT    | `/:medicalRecordId`              | `CREATE_MEDICAL_RECORD_DRAFT` / `VERIFY_AND_FINALIZE_MEDICAL_RECORD` | Update draft / finalize            |
| DELETE | `/:medicalRecordId`              | `DELETE_MEDICAL_RECORD`                                              | Soft delete                        |

### `/api/employees` — authenticated

| Method | Path              | Permission                                  | Purpose                          |
| ------ | ----------------- | ------------------------------------------- | -------------------------------- |
| GET    | `/me`             | any                                         | Current user + profile           |
| GET    | `/doctors`        | `CREATE_APPOINTMENT` / `UPDATE_APPOINTMENT` | Active doctors (for booking)     |
| PUT    | `/update-profile` | `UPDATE_SELF` / `UPDATE_SELF_DIRECT`        | Update or request profile change |

### `/api/nodes` — authenticated (management is OWNER only)

| Method | Path                   | Auth  | Purpose                                   |
| ------ | ---------------------- | ----- | ----------------------------------------- |
| GET    | `/`                    | OWNER | List all nodes (paginated, searchable)    |
| POST   | `/create-node`         | OWNER | Create a sidebar/navigation node          |
| PUT    | `/update-node/:nodeId` | OWNER | Update a node (path is immutable)         |
| DELETE | `/delete-node/:nodeId` | OWNER | Delete a node                             |
| GET    | `/my-nodes`            | any   | Nodes visible to the caller's designation |

### `/api/permissions` — authenticated (management is OWNER only)

| Method | Path                               | Auth  | Purpose                                |
| ------ | ---------------------------------- | ----- | -------------------------------------- |
| GET    | `/`                                | OWNER | Full permission matrix per designation |
| PUT    | `/update-permissions/:designation` | OWNER | Set a designation's permission codes   |
| GET    | `/my-permissions`                  | any   | Effective permissions of the caller    |

### `/api/dashboard` — authenticated

| Method | Path                  | Auth         | Purpose                       |
| ------ | --------------------- | ------------ | ----------------------------- |
| GET    | `/stats`              | any          | Role-specific dashboard stats |
| GET    | `/admin/stats`        | OWNER, ADMIN | Admin overview stats          |
| GET    | `/doctor/stats`       | DOCTOR       | Doctor overview stats         |
| GET    | `/receptionist/stats` | RECEPTIONIST | Receptionist overview stats   |
| GET    | `/appointments/stats` | OWNER, ADMIN | Appointment statistics        |
| GET    | `/patients/stats`     | OWNER, ADMIN | Patient statistics            |
| GET    | `/employees/stats`    | OWNER, ADMIN | Employee statistics           |

### `/api/patient/auth` — patient mobile app

| Method | Path               | Auth    | Purpose                          |
| ------ | ------------------ | ------- | -------------------------------- |
| POST   | `/register`        | —       | Patient self-registration        |
| POST   | `/login`           | —       | Authenticate (rate-limited)      |
| POST   | `/forgot-password` | —       | Request a reset token via email  |
| POST   | `/reset-password`  | —       | Reset password using the token   |
| PUT    | `/change-password` | Patient | Change own password              |
| POST   | `/refresh`         | —       | Exchange refresh token (in body) |
| POST   | `/logout`          | —       | Revoke the refresh token         |

### `/api/patient` — patient mobile app (all require a patient token)

| Method | Path                                             | Purpose                       |
| ------ | ------------------------------------------------ | ----------------------------- |
| GET    | `/me`                                            | Own profile                   |
| PUT    | `/me`                                            | Update own profile            |
| GET    | `/doctors`                                       | Doctors available for booking |
| GET    | `/booked-slots`                                  | Slots already booked          |
| GET    | `/appointments`                                  | Own appointments              |
| POST   | `/appointments`                                  | Book an appointment           |
| PUT    | `/appointments/:appointmentId`                   | Reschedule own appointment    |
| PUT    | `/appointments/:appointmentId/cancel`            | Cancel own appointment        |
| GET    | `/medical-records`                               | Own finalized records         |
| GET    | `/medical-records/by-appointment/:appointmentId` | Own record for an appointment |
| GET    | `/medical-records/:medicalRecordId`              | Own record detail             |

## Data models

Mongoose models live in `src/models/`. Several mint sequential, human-readable
IDs via a shared `Counter`. Soft delete is applied through a reusable
`softDeletePlugin`, and `syncIndexes` (on boot) drops legacy unique indexes that
soft-delete relaxes.

| Model                   | Notes                                           |
| ----------------------- | ----------------------------------------------- |
| `Users`                 | Login accounts; roles, status, tokenVersion     |
| `Employees`             | `EMP-000001` (sequential)                       |
| `Patients`              | `UHID-000001`; own login for the mobile app     |
| `Appointments`          | `APT-000001` (sequential)                       |
| `MedicalRecords`        | Draft/finalized clinical records                |
| `Nodes`                 | Sidebar navigation entries                      |
| `Permissions`           | Permission codes granted per designation        |
| `RefreshTokens`         | Hashed, rotating refresh tokens (with families) |
| `ProfileChangeRequests` | Pending profile edits awaiting approval         |
| `AuditLogs`             | Recorded security-relevant actions              |
| `Bills`, `Payments`     | Supporting domain models                        |
| `Counter`               | Backs the sequential ID generators              |

## Project structure

```text
src/
├── api/index.js          # Vercel serverless handler (connects DB, delegates to app)
├── app.js                # Express app: middleware + route mounting
├── server.js             # Local entrypoint: validate env, connect, sync, seed, listen
├── config/               # db connection, env validation
├── constants/            # statusCodes, messages, domain enums, permissions
├── controllers/          # Route handlers (staff + patient)
├── middlewares/          # auth, node/permission/role gates, validate, errorHandler, rate limiters
├── models/               # Mongoose schemas
├── routes/               # Express routers, one per resource
├── utils/                # tokenService, caches, seeders, email, audit, builders, helpers
└── validators/           # express-validator rule sets
```

## Testing

```bash
npm test                  # all tests
npm run test:unit         # tests/unit
npm run test:integration  # tests/integration
npm run test:coverage     # with coverage
```

Tests run with `NODE_ENV=test`, `--runInBand`, `--forceExit`. A single test:

```bash
npx jest path/to/file.test.js       # one file
npx jest -t "test case name"        # one test by name
```

> The scripts target `tests/unit` and `tests/integration`, which may not exist
> yet — add tests under those paths to use them.

## Deployment

Configured for **Vercel** serverless deployment via `vercel.json`, which routes
all traffic to `src/api/index.js`. That handler establishes the MongoDB
connection per invocation and delegates to the Express `app`. The production
clients call `https://vanguard-hms-rho.vercel.app/api`.

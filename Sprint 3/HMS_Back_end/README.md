# HMS Back End
 
REST API for a **Hospital Management System (HMS)**. Built with Express 5 and
MongoDB (Mongoose), it provides authentication, role/designation-based access
control, employee and patient management, appointment scheduling, an
approval-driven profile-change workflow, audit logging and transactional email.
 
## Tech stack
 
| Area            | Library                            |
| --------------- | ---------------------------------- |
| Runtime         | Node.js                            |
| Web framework   | Express `^5`                       |
| Database / ODM  | MongoDB + Mongoose `^9`            |
| Auth            | jsonwebtoken (JWT), bcryptjs       |
| Validation      | express-validator                  |
| Security / logs | helmet, cors, morgan               |
| Email           | Brevo transactional API (via axios)|
| Config          | dotenv                             |
| Testing         | Jest, Supertest                    |
 
## Prerequisites
 
- Node.js and npm
- A reachable MongoDB instance — local (`mongodb://localhost:27017/hms`) or MongoDB Atlas
 
## Getting started
 
```bash
# 1. Install dependencies
#    NOTE: the "postinstall" hook runs `npm run seed:all`, which needs a
#    reachable MONGO_URI. Create your .env first (see below) or expect the
#    seeding step to fail (install itself still completes).
npm install
 
# 2. Create a .env file in the project root (see "Environment variables")
 
# 3. Run the server
npm run dev     # nodemon (auto-reload) — development
npm start       # plain node — production-style
```
 
The server listens on `PORT` (default **5000**). Quick health checks:
 
- `GET /` → `{ "message": "API running" }`
- `GET /api/db-status` → MongoDB connection state
 
## Environment variables
 
Create a `.env` file in the project root. **Use your own values — never commit
real secrets.** A `.env.example` (placeholders only) is recommended; `.env` is
already gitignored.
 
| Variable         | Description                                              | Example                              |
| ---------------- | ------------------------------------------------------- | ------------------------------------ |
| `MONGO_URI`      | MongoDB connection string                               | `mongodb://localhost:27017/hms`      |
| `FRONTEND_URL`   | Allowed CORS origin (the Angular app)                   | `http://localhost:4200`              |
| `PORT`           | Port the API listens on                                 | `5000`                               |
| `JWT_SECRET`     | Secret used to sign/verify JWTs                          | `<long-random-string>`               |
| `JWT_EXPIRES_IN` | JWT lifetime                                             | `1d`                                 |
| `BREVO_API_KEY`  | Brevo (Sendinblue) API key for transactional email      | `<your-brevo-key>`                   |
| `EMAIL_USER`     | Sender email address                                    | `no-reply@example.com`               |
| `OWNER_PASS`     | Password for the auto-seeded OWNER account              | `<strong-password>`                  |
| `NODE_ENV`       | Environment mode (optional)                             | `development`                        |
| `TZ`             | Process timezone; defaults to `Asia/Kolkata` (optional) | `Asia/Kolkata`                       |
 
> ⚠️ **Security note:** the committed `.env` in this repo contains live-looking
> secrets. Rotate `JWT_SECRET`, `BREVO_API_KEY` and `OWNER_PASS`, and keep real
> values out of version control.
 
## Seeding & default login
 
Seeders run automatically in three places: on `postinstall`, on server startup
(non-fatal — a seeding error won't stop the API), and manually:
 
```bash
npm run seed:all
```
 
Seeding creates the sidebar navigation **nodes** and a single **OWNER** account:
 
| Field    | Value                                |
| -------- | ------------------------------------ |
| Username | `owner`                              |
| Email    | `owner@hospital.com`                 |
| Password | value of `OWNER_PASS` in your `.env` |
 
The OWNER is seeded with `mustChangePassword: false`. Staff/admin accounts
created through the app are typically issued a temporary password and flagged to
change it on first login.
 
## Roles & designations
 
Authorization is layered on **roles** and **designations**.
 
- **Roles** (on the `User`): `OWNER`, `ADMIN`, `STAFF`.
- **Staff designations**: `DOCTOR`, `RECEPTIONIST`, `CASHIER`, `NURSE`, `LAB_TECH`, `PHARMACIST`. `OWNER` and `ADMIN` are restricted designations created through dedicated flows (never self-registerable).
 
Department → allowed designations (`src/constants/domain.js`):
 
| Department       | Designations        |
| ---------------- | ------------------- |
| `OPD`            | DOCTOR, NURSE       |
| `IPD`            | DOCTOR, NURSE       |
| `Lab`            | LAB_TECH            |
| `Pharmacy`       | PHARMACIST          |
| `Reception`      | RECEPTIONIST        |
| `Billing`        | CASHIER             |
| `Administration` | (admins/owner)      |
 
Additional rules:
 
- **Medical registration number** required for `DOCTOR`, `NURSE`, `PHARMACIST`.
- **Specialization** field applies to `DOCTOR`, `LAB_TECH`.
 
## Project structure
 
```text
src/
├── api/
│   └── index.js            # Vercel serverless handler (connects DB, delegates to app)
├── app.js                  # Express app: middleware + route mounting
├── server.js               # Local entrypoint: connect DB, seed, listen
├── config/
│   └── db.js               # Mongoose connection
├── constants/
│   ├── domain.js           # Roles, designations, departments, mappings
│   ├── messages.js         # Centralised response/message strings
│   └── statusCodes.js      # Named HTTP status codes
├── controllers/            # Route handlers (auth, admin, owner, patient[s], appointment,
│                           #   employee, node, dashboard, patientAuth, patientSelf)
├── middlewares/
│   ├── authMiddleware.js           # Verifies staff JWT, sets req.user
│   ├── patientAuthMiddleware.js    # Verifies patient JWT, sets req.patient
│   ├── authorizeRolesMiddleware.js
│   ├── authorizeDesignations.js
│   ├── validate.js                 # express-validator result handler
│   ├── notFound.js                 # JSON 404 envelope for unknown routes
│   └── errorHandler.js             # Centralised error handler (last middleware)
├── models/                 # Mongoose schemas
├── routes/                 # Express routers, one per resource
├── utils/                  # AppError + apiResponse (sendSuccess) response envelope,
│                           #   seeders, email, audit, pagination, appointment & patient helpers
└── validators/             # express-validator rule sets
```
 
## Authentication
 
There are **two independent token domains**, both signed with `JWT_SECRET` and
both sent as a Bearer token:
 
```text
Authorization: Bearer <jwt>
```
 
**Staff** (web admin panel) — `authMiddleware` verifies the token and populates
`req.user`. Access is then narrowed by `authorizeRoles(...)` (role-based) or
`authorizeDesignations(...)` (designation-based). `OWNER` and `ADMIN` are
effectively superusers across most flows.
 
**Patients** (mobile app) — `patientAuthMiddleware` verifies a separate token
that carries `type: "PATIENT"` and populates `req.patient`. Patient tokens only
work against the `/api/patient/*` routes; staff tokens only work against the
staff routes.
 
## API reference
 
Base paths are mounted in `src/app.js`. All paths below are relative to the
server root (e.g. `POST /api/auth/login`).
 
### Public / health
| Method | Path             | Purpose                     |
| ------ | ---------------- | --------------------------- |
| GET    | `/`              | Liveness check              |
| GET    | `/api/db-status` | MongoDB connection state    |
 
### `/api/auth`
| Method | Path               | Auth   | Purpose                                   |
| ------ | ------------------ | ------ | ----------------------------------------- |
| POST   | `/login`           | —      | Authenticate, returns JWT + user          |
| POST   | `/self-register`   | —      | Staff self-registration (pending approval)|
| PUT    | `/change-password` | Bearer | Change own password                       |
| POST   | `/forgot-password` | —      | Request a password-reset token via email  |
| POST   | `/reset-password`  | —      | Reset password using the token            |
| POST   | `/logout`          | Bearer | Logout (records last activity)            |
| GET    | `/me`              | Bearer | Current authenticated user                |
 
### `/api/admin` — OWNER, ADMIN
| Method | Path                                  | Purpose                          |
| ------ | ------------------------------------- | -------------------------------- |
| POST   | `/create-employee`                    | Create a staff employee + account|
| GET    | `/employees`                          | List employees                   |
| GET    | `/employees/:employeeCode`            | Get one employee                 |
| GET    | `/pending-employees`                  | List self-registered, pending    |
| PUT    | `/approve-employee/:employeeCode`     | Approve a pending employee       |
| PUT    | `/reject-employee/:employeeCode`      | Reject a pending employee        |
| PUT    | `/update-employee/:employeeCode`      | Update an employee               |
| DELETE | `/delete-employee/:employeeCode`      | Delete an employee + account     |
| GET    | `/audit-logs`                         | Read audit log                   |
| GET    | `/profile-change-requests`            | List pending profile changes     |
| PUT    | `/approve-profile-change/:requestId`  | Approve a profile change         |
| PUT    | `/reject-profile-change/:requestId`   | Reject a profile change          |
 
### `/api/owner` — OWNER only
| Method | Path                          | Purpose            |
| ------ | ----------------------------- | ------------------ |
| POST   | `/create-admin`               | Create an ADMIN    |
| GET    | `/admins`                     | List admins        |
| PUT    | `/update-admin/:employeeCode` | Update an admin    |
| DELETE | `/delete-admin/:employeeCode` | Delete an admin    |
 
### `/api/patients` — OWNER, ADMIN, RECEPTIONIST
| Method | Path               | Purpose                 |
| ------ | ------------------ | ----------------------- |
| POST   | `/create-patient`  | Register a patient      |
| GET    | `/search`          | Search patients         |
| GET    | `/`                | List patients           |
| GET    | `/:UHID`           | Get a patient by UHID   |
| PUT    | `/:UHID`           | Update a patient        |
 
### `/api/appointments`
| Method | Path                       | Auth                                  | Purpose                       |
| ------ | -------------------------- | ------------------------------------- | ----------------------------- |
| POST   | `/create-appointment`      | OWNER, ADMIN, RECEPTIONIST            | Book an appointment           |
| GET    | `/my`                      | DOCTOR                                | Doctor's own appointments     |
| GET    | `/booked-slots`            | OWNER, ADMIN, RECEPTIONIST            | Slots already booked          |
| GET    | `/`                        | OWNER, ADMIN, RECEPTIONIST, DOCTOR    | List appointments             |
| GET    | `/:appointmentId`          | OWNER, ADMIN, RECEPTIONIST, DOCTOR    | Appointment detail            |
| PUT    | `/:appointmentId`          | OWNER, ADMIN, RECEPTIONIST            | Reschedule / update           |
| PUT    | `/:appointmentId/cancel`   | OWNER, ADMIN, RECEPTIONIST            | Cancel (with reason)          |
| PUT    | `/:appointmentId/complete` | DOCTOR                                | Mark completed                |
 
### `/api/employees` — authenticated
| Method | Path              | Auth                       | Purpose                              |
| ------ | ----------------- | -------------------------- | ------------------------------------ |
| GET    | `/me`             | any                        | Current user + profile               |
| GET    | `/doctors`        | OWNER, ADMIN, RECEPTIONIST | Active doctors (for booking)         |
| PUT    | `/update-profile` | any                        | Submit a profile-change request      |
 
### `/api/nodes` — authenticated
| Method | Path                  | Auth        | Purpose                                  |
| ------ | --------------------- | ----------- | ---------------------------------------- |
| POST   | `/create-node`        | ADMIN, OWNER| Create a sidebar/navigation node         |
| PUT    | `/update-node/:nodeId`| ADMIN, OWNER| Update a node                            |
| DELETE | `/delete-node/:nodeId`| ADMIN, OWNER| Delete a node                            |
| GET    | `/my-nodes`           | any         | Nodes visible to the user's designation  |
 
### `/api/patient/auth` — patient mobile app (public)
 
These power the [PatientApp](../PatientApp) mobile client. They are separate from
the staff `/api/auth` flow and issue **patient** tokens (`type: "PATIENT"`).
 
| Method | Path               | Auth         | Purpose                                  |
| ------ | ------------------ | ------------ | ---------------------------------------- |
| POST   | `/register`        | —            | Self-register a patient account          |
| POST   | `/login`           | —            | Authenticate, returns patient JWT        |
| POST   | `/forgot-password` | —            | Request a password-reset code via email  |
| POST   | `/reset-password`  | —            | Reset password using the code            |
| PUT    | `/change-password` | Patient JWT  | Change own password                      |
 
### `/api/patient` — patient mobile app (patient JWT)
 
Every route requires a valid patient token (`patientAuthMiddleware`).
 
| Method | Path                              | Purpose                                  |
| ------ | --------------------------------- | ---------------------------------------- |
| GET    | `/me`                             | Get own patient profile                  |
| PUT    | `/me`                             | Update own profile (contact, address…)   |
| GET    | `/doctors`                        | List active doctors (for booking)        |
| GET    | `/booked-slots`                   | Slots already booked for a doctor/date   |
| GET    | `/appointments`                   | List own appointments (by status)        |
| POST   | `/appointments`                   | Book an appointment                      |
| PUT    | `/appointments/:appointmentId`    | Reschedule / update own appointment      |
| PUT    | `/appointments/:appointmentId/cancel` | Cancel own appointment (with reason) |
 
> **Note:** `src/routes/dashboardRoutes.js` and `dashboardController.js` exist
> (dashboard/statistics endpoints) but are **not currently mounted** in
> `src/app.js`, so those routes are not reachable until wired up.
 
## Data models
 
Mongoose models live in `src/models/`. Several use a shared `Counter` to mint
sequential, human-readable IDs:
 
| Model                  | ID format / notes                          |
| ---------------------- | ------------------------------------------ |
| `Users`                | Login accounts; roles, status, password    |
| `Employees`            | `EMP-000001` (sequential)                  |
| `Patients`             | `UHID-000001` (sequential)                 |
| `Appointments`         | `APT-000001` (sequential)                  |
| `Nodes`                | Sidebar navigation entries                 |
| `ProfileChangeRequests`| Pending profile edits awaiting approval    |
| `AuditLogs`            | Recorded actions                           |
| `Bills`, `Payments`, `MedicalRecords` | Supporting domain models    |
| `Counter`              | Backs the sequential ID generators         |
 
## Testing
 
```bash
npm test               # all tests
npm run test:unit      # tests/unit
npm run test:integration   # tests/integration
npm run test:coverage  # with coverage
```
 
> The test scripts target a `tests/` directory which is not present in the repo
> yet; add tests under `tests/unit` and `tests/integration` to use them.
 
## Deployment
 
Configured for **Vercel** serverless deployment via `vercel.json`, which routes
all traffic to `src/api/index.js`. That handler establishes the MongoDB
connection per invocation and delegates to the Express `app`. The production
frontend is configured to call `https://vanguard-hms-rho.vercel.app/api`.
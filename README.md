# Vanguard HMS — Project Setup & Run Guide

A monorepo Hospital Management System with three apps that share one backend API.

Prerequisites

Node.js 20.19+, npm, a running MongoDB, Angular CLI (npm i -g @angular/cli), Expo Go, Git.

Get the Code

Clone the repository and enter it:

```bash
git clone <repository-url>
cd Vanguard-HMS
```

Switch to the active feature branch:

```bash
git checkout feature/sprint5_pod1_ashbin
```

## 1. Backend — HMS_Back_end

Enter the backend folder:

```bash
cd HMS_Back_end
```

Create a .env file in the backend root before running npm install — the postinstall step seeds the database and needs these values:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_employee_jwt_secret
JWT_PATIENT_SECRET=your_patient_jwt_secret
JWT_EXPIRES_IN=your_access_token_lifetime
REFRESH_TOKEN_EXPIRES_DAYS=your_refresh_token_lifetime_in_days
OWNER_PASS=your_owner_password
FRONTEND_URL=your_frontend_url
PATIENT_APP_URL=your_patient_app_deep_link_base
EMAIL_USER=your_sender_email
BREVO_API_KEY=your_brevo_api_key
PORT=your_server_port
```

Note the boot-time validation rules:

MONGO_URI, JWT_SECRET, JWT_PATIENT_SECRET, JWT_EXPIRES_IN, and REFRESH_TOKEN_EXPIRES_DAYS are required.

Both JWT secrets must be at least 32 characters (and different from each other) or the server won't start.

OWNER_PASS isn't validated at boot, but the owner seeder throws without it, so the owner account won't be created.

Install and run:

```bash
npm install      # also runs postinstall → seed:all (needs a reachable MONGO_URI)
npm run dev      # nodemon auto-reload (dev)
# or
npm start        # plain node (prod-style)
```

Confirm it is up:

On boot the server validates env, connects to Mongo, syncs indexes, seeds nodes / permissions / owner, then listens.

Health check: open /api/db-status on the API.

If Mongo is unreachable at startup the server exits. During npm install, seeding failures are logged but the install still completes — re-run seeding later with npm run seed:all.

Tests (optional):

```bash
npm test
npm run test:unit
npm run test:integration
npm run test:coverage
```

## 2. Admin Web Panel — HMS_Front_end

Install and start:

```bash
cd HMS_Front_end
npm install
npm start        # equivalent to `ng serve`
```

Open the dev server in the browser.

No .env is needed. proxy.conf.json proxies /api to the backend, so the app and API share an origin and the httpOnly refresh cookie stays first-party.

Start the backend before the frontend so the proxy target is up.

Production build:

```bash
npm run build
```

(outputs to dist/Admin-Panel/browser).

Tests:

```bash
npm test
```

(Vitest + jsdom).

Log in with the seeded owner:

```text
username owner
password = your OWNER_PASS
```

## 3. Patient App — PatientApp

Install:

```bash
cd PatientApp
npm install
```

Create a .env file with the backend URL (use your machine's LAN IP instead of localhost for a physical device via Expo Go):

```env
EXPO_PUBLIC_API_URL=your_backend_api_url
```

Start it:

```bash
npx expo start
# or:
npm start
```

Then choose an Android emulator, iOS simulator, Expo Go (scan the QR), or web (npm run web). The deep-link scheme is hmsapp:// and must match the backend's PATIENT_APP_URL for emailed login / reset links to open the app.

## Startup Order

Start MongoDB.

Backend: create .env, npm install, npm run dev.

Frontend: npm install, ng serve.

Mobile: create .env, npm install, npx expo start.

## Deployment (CI/CD)

Deployment is automated to a single EC2 host via GitHub Actions (.github/workflows/deploy.yml).

On a push to the deploy branch, the workflow SSHes into the EC2 instance, hard-resets the repo to the pushed commit, then:

Backend: runs npm ci, restarts the API under pm2 (healthcare-api), and health-checks it.

Frontend: builds the Angular app and copies dist/Admin-Panel/browser into the Nginx web root, then restarts Nginx — which serves the built app and reverse-proxies /api to the backend.

Configure these secrets on the GitHub repository / environment:

```env
EC2_HOST=your_ec2_host
EC2_USER=your_ec2_ssh_user
EC2_SSH_KEY=your_ec2_private_ssh_key
```

The EC2 host keeps its own backend .env (pm2 loads it via --update-env). The secrets above are only for the SSH connection, not the application config.

## Project Claude Commands

Custom slash commands live in .claude/commands/ for use with Claude Code.

### /deploy-preflight

Mirrors the EC2 deploy pipeline locally before you push (git readiness, backend boot smoke, Angular production build) and ends with a GO / NO-GO verdict.

Verify-only; it never commits, pushes, or edits tracked files.

Flags:

```text
--skip-build
--health
--fetch
--changed
```

### /sprint-report

Generates a sprint / changelog report from git history, grouped by app area and contributor.

Flags include:

```text
--since
--until
--author
--branch
--area
--audience
--format
--enrich
--save
```
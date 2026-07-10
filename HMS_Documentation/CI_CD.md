# Continuous Integration & Deployment

---

Backend

Developer

↓

Git Push

↓

GitHub Actions

↓

SSH

↓

AWS EC2

↓

Git Fetch

↓

Git Reset

↓

npm install

↓

PM2 Restart

↓

Health Check

---

Frontend

Git Push

↓

GitHub Actions

↓

SSH

↓

npm ci

↓

Angular Build

↓

Copy Files

↓

Reload NGINX

↓

Application Live

---

React Native

Git Push

↓

GitHub Actions

↓

Expo EAS Build

↓

Cloud Build

↓

APK Generated

---

Deployment Features

- Automatic Deployment
- Zero Manual Upload
- Production Build
- PM2 Process Restart
- Health Verification
- NGINX Reload
- HTTPS Enabled


Git Push
     │
     ▼
GitHub Actions
     │
     ▼
Deploy
     │
     ▼
Health Check
     │
 ┌───┴────┐
 │        │
Pass    Fail
 │        │
 │    Manual Rollback
 │        │
 └────────┘
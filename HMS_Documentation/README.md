# 🏥 Hospital Management System

A complete Hospital Management System developed as part of Bootstrap Sprint Program.

The project consists of three independent applications communicating through REST APIs.

---

# Project Architecture

                Internet
                    │
                    │
          bootstraphms.duckdns.org
                    │
             HTTPS (443)
                    │
               NGINX Reverse Proxy
          ┌─────────┴──────────┐
          │                    │

Angular Admin Node.js Backend
Frontend Express API
│
│
MongoDB Atlas
│
│
React Native App

## Tech Stack

- Angular
- Node.js
- Express
- MongoDB Atlas
- React Native
- AWS EC2
- NGINX
- PM2
- GitHub Actions
- Expo EAS
- Docker Ready
- JWT Authentication
- RBAC

---

## Project Structure

```
Hospital-Management-System
│
├── HMS_Backend
├── HMS_Frontend
├── HMSMobile
│
├── README.md
├── SYSTEM_DESIGN.md
├── DEPLOYMENT_GUIDE.md
├── API_DOCUMENTATION.md
├── DATABASE_SCHEMA.md
├── SECURITY.md
├── CI_CD.md
└── TROUBLESHOOTING.md
```

---

## Deployment

Deployment includes:

- GitHub Actions
- PM2
- NGINX
- Health Checks
- Manual Rollback Strategy

---

## Clone Repository

```bash
git clone --recurse-submodules https://github.com/bootcamp-hackerearth/UST-Live-02/tree/feature/sprint5_pod5_visagan
```

If already cloned

```bash
git submodule update --init --recursive
```

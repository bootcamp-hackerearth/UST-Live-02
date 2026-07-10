#  Hospital Management System - Backend

## Overview

Hospital Management System Backend is a RESTful API built using Node.js, Express.js, and MongoDB. It provides authentication, role-based authorization, employee management, patient management, appointments, consultations, health records, audit logging, and dashboard services.

---

## 🚀 Technology Stack

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose

### Authentication
- JWT
- Refresh Token
- RBAC

### Security
- Helmet
- CORS
- Express Validator
- bcrypt

### Logging
- Morgan
- Winston

### Deployment
- AWS EC2
- PM2
- Nginx
- GitHub Actions
- DuckDNS
- Let's Encrypt SSL

---

## ✨ Features

### Authentication
- Login
- Logout
- Refresh Token
- Change Password
- Forgot Password

### Employee Module
- Employee CRUD
- Doctor Management
- Receptionist Management
- Pharmacist Management
- Lab Technician Management

### Patient Module
- Patient Registration
- Profile Management
- Medical History

### Appointment Module
- Book Appointment
- Cancel Appointment
- Update Appointment
- Doctor Queue

### Consultation
- Consultation Notes
- Prescription
- Diagnosis

### Health Records
- Lab Reports
- Medical Documents
- Prescriptions

### Dashboard
- Statistics
- Audit Logs

---

## 📂 Project Structure

src/
├── config
├── controllers
├── middleware
├── models
├── routes
├── services
├── utils
├── validations
└── server.js

---

## ⚙️ Installation

```bash
git clone <repo>

cd HMS_Backend

npm install

npm run dev
```

---

## 🔑 Environment Variables

```env
PORT=

NODE_ENV=

MONGODB_URI=

JWT_SECRET=

JWT_REFRESH_SECRET=

EMAIL_USER=

EMAIL_PASS=
```

---

## 🚀 Deployment

- AWS EC2
- PM2
- Nginx Reverse Proxy
- HTTPS using Let's Encrypt
- GitHub Actions CI/CD

Deployment Flow

Developer

↓

GitHub

↓

GitHub Actions

↓

SSH

↓

AWS EC2

↓

PM2 Restart

↓

Health Check

---

## 🔒 Security

- Helmet
- JWT Authentication
- RBAC
- Password Hashing
- HTTPS
- UFW Firewall
- Fail2Ban
- Automatic Security Updates

---

## 📈 Monitoring

- PM2
- PM2 Monit
- PM2 Log Rotation
- Winston Logs
- Morgan Logs
- Nginx Logs

---

## Health Check

GET

```
/health
```

Response

```json
{
  "success": true,
  "message": "Server is running"
}
```

---

## 👨‍💻 Contributors

Bootstrap Team
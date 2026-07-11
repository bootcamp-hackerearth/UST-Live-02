# API Documentation

## Base URL

https://bootstrap-hms.duckdns.org/api

---

# Authentication

All protected APIs require

Authorization: Bearer <JWT_TOKEN>

---

# Authentication APIs

POST /auth/login

Description

User Login

Request

{
"email":"admin@gmail.com",
"password":"**\*\*\*\***"
}

Response

{
"accessToken":"",
"refreshToken":""
}

---

POST /auth/refresh-token

Generates new access token.

---

POST /auth/logout

Logs out user.

---

GET /auth/me

Returns logged in user.

---

# Employee APIs

GET /employees

Returns all employees.

GET /employees/:id

Returns employee details.

POST /employees

Creates employee.

PUT /employees/:id

Updates employee.

DELETE /employees/:id

Deletes employee.

---

# Patient APIs

GET /patients

POST /patients

PUT /patients/:id

DELETE /patients/:id

---

# Appointment APIs

GET /appointments

POST /appointments

PUT /appointments/:id

DELETE /appointments/:id

GET /appointments/doctor-queue

---

# Consultation APIs

GET /consultations

POST /consultations

PUT /consultations/:id

GET /consultations/:id

---

# Health Records

GET /health-records

GET /health-records/:patientId

POST /health-records/lab-report

POST /health-records/document

DELETE /health-records/lab-report/:id

DELETE /health-records/document/:id

---

# Dashboard

GET /dashboard

GET /dashboard/audit-logs

GET /dashboard/stats

---

# Health Check

GET /health

Response

{
"success":true,
"message":"Server is running"
}

# Database Schema

Database

MongoDB Atlas

---

Collections

Users

Employees

Patients

Appointments

Consultations

AuditLogs

Counters

---

Users

- email
- passwordHash
- roles
- employeeId
- patientId
- status
- lastLogin

---

Employees

- employeeCode
- firstName
- lastName
- email
- phone
- designation
- department

---

Patients

- patientId
- name
- age
- gender
- bloodGroup
- labReports
- prescriptions
- medicalDocuments

---

Appointments

- appointmentId
- patientId
- doctorId
- appointmentDate
- tokenNumber
- status

---

Consultations

- consultationId
- appointmentId
- diagnosis
- notes
- prescriptions

---

Audit Logs

- action
- module
- user
- timestamp
- details

---

Counters

Stores sequential IDs.

Example

DOC-000001

PAT-000001

APT-000001
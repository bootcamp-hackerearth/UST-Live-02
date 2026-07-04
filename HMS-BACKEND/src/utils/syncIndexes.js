const User = require("../models/Users");
const Employee = require("../models/Employees");
const Patient = require("../models/Patients");
const Appointment = require("../models/Appointments");
const MedicalRecord = require("../models/MedicalRecords");
const AuditLog = require("../models/AuditLogs");

// Reconciles DB indexes with current schemas
async function syncIndexes() {
  await Promise.all([
    User.syncIndexes(),
    Employee.syncIndexes(),
    Patient.syncIndexes(),
    Appointment.syncIndexes(),
    MedicalRecord.syncIndexes(),
    AuditLog.syncIndexes(),
  ]);
}

module.exports = syncIndexes;

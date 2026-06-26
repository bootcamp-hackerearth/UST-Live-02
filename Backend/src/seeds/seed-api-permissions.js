require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const ApiPermission = require("../models/ApiPermission");

const ALL_ROLES = ["SUPER_ADMIN", "ADMIN", "DOCTOR", "RECEPTIONIST", "PATIENT"];

const permissions = [
  { key: "dashboard:admin-stats", allowedRoles: ["SUPER_ADMIN", "ADMIN"] },
  { key: "dashboard:recent-employees", allowedRoles: ["SUPER_ADMIN", "ADMIN"] },
  { key: "dashboard:doctor-stats", allowedRoles: ["DOCTOR"] },
  { key: "dashboard:receptionist-stats", allowedRoles: ["RECEPTIONIST"] },
  { key: "dashboard:today-appointments", allowedRoles: ["DOCTOR"] },

  { key: "employee:create", allowedRoles: ["SUPER_ADMIN", "ADMIN"] },
  { key: "employee:list", allowedRoles: ["SUPER_ADMIN", "ADMIN"] },
  { key: "employee:pending-list", allowedRoles: ["SUPER_ADMIN", "ADMIN"] },
  { key: "employee:approve", allowedRoles: ["SUPER_ADMIN", "ADMIN"] },
  { key: "employee:reject", allowedRoles: ["SUPER_ADMIN", "ADMIN"] },
  { key: "employee:deactivate", allowedRoles: ["SUPER_ADMIN", "ADMIN"] },
  { key: "employee:detail", allowedRoles: ["SUPER_ADMIN", "ADMIN"] },
  { key: "employee:update", allowedRoles: ["SUPER_ADMIN", "ADMIN"] },
  { key: "employee:delete", allowedRoles: ["SUPER_ADMIN", "ADMIN"] },
  { key: "employee:activate", allowedRoles: ["SUPER_ADMIN", "ADMIN"] },
  { key: "doctor:availability:view", allowedRoles: ["DOCTOR"] },
  { key: "doctor:availability:update", allowedRoles: ["DOCTOR"] },

  { key: "patient:create", allowedRoles: ["SUPER_ADMIN", "ADMIN", "RECEPTIONIST"] },
  { key: "patient:list", allowedRoles: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "RECEPTIONIST"] },
  { key: "patient:profile:view", allowedRoles: ["PATIENT"] },
  { key: "patient:profile:update", allowedRoles: ["PATIENT"] },
  { key: "patient:dashboard", allowedRoles: ["PATIENT"] },
  { key: "patient:detail", allowedRoles: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "RECEPTIONIST"] },
  { key: "patient:update", allowedRoles: ["SUPER_ADMIN", "ADMIN", "RECEPTIONIST"] },
  { key: "patient:delete", allowedRoles: ["SUPER_ADMIN", "ADMIN"] },

  { key: "appointment:doctor-queue", allowedRoles: ["DOCTOR"] },
  { key: "appointment:available-slots", allowedRoles: ALL_ROLES },
  { key: "appointment:list", allowedRoles: ALL_ROLES },
  { key: "appointment:patient-book", allowedRoles: ["PATIENT"] },
  { key: "appointment:my-list", allowedRoles: ["PATIENT"] },
  { key: "appointment:pending-list", allowedRoles: ["SUPER_ADMIN", "ADMIN"] },
  { key: "appointment:approve", allowedRoles: ["SUPER_ADMIN", "ADMIN"] },
  { key: "appointment:reject", allowedRoles: ["SUPER_ADMIN", "ADMIN"] },
  { key: "appointment:my-update", allowedRoles: ["PATIENT"] },
  { key: "appointment:my-cancel", allowedRoles: ["PATIENT"] },
  { key: "appointment:detail", allowedRoles: ALL_ROLES },
  { key: "appointment:create", allowedRoles: ["SUPER_ADMIN", "ADMIN", "RECEPTIONIST"] },
  { key: "appointment:update", allowedRoles: ["SUPER_ADMIN", "ADMIN", "RECEPTIONIST"] },
  { key: "appointment:delete", allowedRoles: ["SUPER_ADMIN", "ADMIN"] },

  { key: "consultation:create", allowedRoles: ["DOCTOR"] },
  { key: "consultation:list", allowedRoles: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "RECEPTIONIST"] },
  { key: "consultation:pdf", allowedRoles: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "RECEPTIONIST", "PATIENT"] },
  { key: "consultation:by-appointment", allowedRoles: ["DOCTOR"] },
  { key: "consultation:detail", allowedRoles: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "RECEPTIONIST", "PATIENT"] },

  { key: "medical-record:patients", allowedRoles: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "RECEPTIONIST"] },
  { key: "medical-record:prescriptions", allowedRoles: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "RECEPTIONIST"] },
  { key: "medical-record:prescriptions-my", allowedRoles: ["PATIENT"] },
  { key: "medical-record:prescriptions-patient", allowedRoles: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "RECEPTIONIST"] },
  { key: "medical-record:prescription-detail", allowedRoles: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "RECEPTIONIST", "PATIENT"] },
  { key: "medical-record:health-records", allowedRoles: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "RECEPTIONIST"] },
  { key: "medical-record:health-records-my", allowedRoles: ["PATIENT"] },
  { key: "medical-record:health-records-patient", allowedRoles: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "RECEPTIONIST"] },
  { key: "medical-record:health-record-detail", allowedRoles: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "RECEPTIONIST", "PATIENT"] },
  { key: "medical-record:health-record-create", allowedRoles: ["SUPER_ADMIN", "ADMIN", "RECEPTIONIST"] },
  { key: "medical-record:health-record-update", allowedRoles: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "RECEPTIONIST"] },
  { key: "medical-record:health-record-delete", allowedRoles: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "RECEPTIONIST"] },
  { key: "medical-record:lab-reports", allowedRoles: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "RECEPTIONIST"] },
  { key: "medical-record:lab-reports-my", allowedRoles: ["PATIENT"] },
  { key: "medical-record:lab-reports-patient", allowedRoles: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "RECEPTIONIST"] },
  { key: "medical-record:lab-report-create", allowedRoles: ["SUPER_ADMIN", "ADMIN", "RECEPTIONIST"] },
  { key: "medical-record:lab-report-update", allowedRoles: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "RECEPTIONIST"] },
  { key: "medical-record:lab-report-delete", allowedRoles: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "RECEPTIONIST"] },

  { key: "menu-node:create", allowedRoles: ["SUPER_ADMIN", "ADMIN"] },
  { key: "menu-node:list", allowedRoles: ["SUPER_ADMIN", "ADMIN"] },
  { key: "menu-node:update", allowedRoles: ["SUPER_ADMIN", "ADMIN"] },
  { key: "menu-node:delete", allowedRoles: ["SUPER_ADMIN", "ADMIN"] },
];

const seedApiPermissions = async () => {
  await connectDB();

  for (const permission of permissions) {
    await ApiPermission.findOneAndUpdate(
      { key: permission.key },
      {
        key: permission.key,
        description: permission.description || permission.key,
        allowedRoles: permission.allowedRoles,
        isActive: true,
      },
      {
        upsert: true,
        returnDocument: "after",
      }
    );
  }

  console.log("API permissions seeded successfully");
  await mongoose.connection.close();
};

seedApiPermissions().catch(async (error) => {
  console.error("API permission seed failed", error);
  await mongoose.connection.close();
  process.exit(1);
});


const ROLES = require("./roles");

module.exports = [
  //dashboards

  {
    name: "Admin Dashboard",
    path: "/dashboard/admin",
    icon: "dashboard",
    order: 1,
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    apiPermissions: [
      { method: "GET", path: "/api/dashboard/admin-stats" },
      { method: "GET", path: "/api/dashboard/recent-employees" },
      { method: "POST", path: "/api/nodes" },
      { method: "PUT", path: "/api/nodes/:id" },
      { method: "DELETE", path: "/api/nodes/:id" },
    ],
  },

  {
    name: "Doctor Dashboard",
    path: "/dashboard/doctor",
    icon: "dashboard",
    order: 2,
    roles: [ROLES.DOCTOR],
    apiPermissions: [
      { method: "GET", path: "/api/dashboard/doctor-stats" },
      { method: "GET", path: "/api/dashboard/today-appointments" },
    ],
  },

  {
    name: "Receptionist Dashboard",
    path: "/dashboard/receptionist",
    icon: "dashboard",
    order: 3,
    roles: [ROLES.RECEPTIONIST],
    apiPermissions: [
      { method: "GET", path: "/api/dashboard/receptionist-stats" },
      { method: "GET", path: "/api/dashboard/today-appointments" },
    ],
  },

  // parent menus

  {
    name: "Employees",
    path: "/employees",
    icon: "groups",
    order: 10,
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    apiPermissions: [
      { method: "GET", path: "/api/employees" },
      { method: "GET", path: "/api/employees/doctors" },
      { method: "GET", path: "/api/employees/:id" },
      { method: "PUT", path: "/api/employees/:id" },
      { method: "PATCH", path: "/api/employees/:id/activate" },
      { method: "PATCH", path: "/api/employees/:id/deactivate" },
      { method: "DELETE", path: "/api/employees/:id" },
    ],
  },

  {
    name: "Patients",
    path: "/patients",
    icon: "people",
    order: 20,
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR],
    apiPermissions: [
      { method: "GET", path: "/api/patients" },
      { method: "GET", path: "/api/patients/:id" },
      {
        method: "PUT",
        path: "/api/patients/:id",
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.RECEPTIONIST],
      },
      {
        method: "DELETE",
        path: "/api/patients/:id",
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
      },
    ],
  },

  {
    name: "Appointments",
    path: "/appointments",
    icon: "event",
    order: 30,
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR],
    apiPermissions: [
      { method: "GET", path: "/api/appointments" },
      { method: "GET", path: "/api/appointments/available-slots" },
      { method: "GET", path: "/api/employees/doctors" },
      { method: "GET", path: "/api/appointments/:id" },
      {
        method: "PUT",
        path: "/api/appointments/:id",
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.RECEPTIONIST],
      },
      {
        method: "DELETE",
        path: "/api/appointments/:id",
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.RECEPTIONIST],
      },
    ],
  },

  {
    name: "Health Records",
    path: "/health-records",
    icon: "folder_shared",
    order: 40,
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR],
    apiPermissions: [
      { method: "GET", path: "/api/health-records" },
      { method: "GET", path: "/api/health-records/:patientId" },
      { method: "POST", path: "/api/health-records/:patientId/lab-reports" },
      {
        method: "PUT",
        path: "/api/health-records/:patientId/lab-reports/:reportId",
      },
      {
        method: "DELETE",
        path: "/api/health-records/:patientId/lab-reports/:reportId",
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
      },
      {
        method: "POST",
        path: "/api/health-records/:patientId/medical-documents",
      },
      {
        method: "PUT",
        path: "/api/health-records/:patientId/medical-documents/:documentId",
      },
      {
        method: "DELETE",
        path: "/api/health-records/:patientId/medical-documents/:documentId",
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
      },
      { method: "GET", path: "/api/consultations" },
      { method: "GET", path: "/api/consultations/appointment/:appointmentId" },
      { method: "GET", path: "/api/consultations/:id" },
      { method: "GET", path: "/api/consultations/prescription/:consultationId" },
      {
        method: "DELETE",
        path: "/api/consultations/:id",
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
      },
    ],
  },

  {
    name: "Doctor Queue",
    path: "/doctor-queue",
    icon: "queue",
    order: 50,
    roles: [ROLES.DOCTOR],
    apiPermissions: [
      { method: "GET", path: "/api/appointments/doctor-queue" },
      { method: "POST", path: "/api/consultations" },
      { method: "PUT", path: "/api/consultations/:id" },
    ],
  },

  {
    name: "Doctor Availability",
    path: "/doctor-availability",
    icon: "schedule",
    order: 60,
    roles: [ROLES.DOCTOR],
    apiPermissions: [
      { method: "GET", path: "/api/employees/doctor/availability" },
      { method: "PATCH", path: "/api/employees/doctor/availability" },
    ],
  },

  {
    name: "My Profile",
    path: "/my-profile",
    icon: "account_circle",
    order: 100,
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR],
  },

  {
    name: "Patient Portal",
    path: "/patient-portal",
    icon: "personal_injury",
    order: 200,
    roles: [ROLES.PATIENT],
    apiPermissions: [
      { method: "GET", path: "/api/patients/profile" },
      { method: "PUT", path: "/api/patients/profile" },
      { method: "GET", path: "/api/patients/dashboard" },
      { method: "GET", path: "/api/appointments/available-slots" },
      { method: "GET", path: "/api/employees/doctors" },
      { method: "POST", path: "/api/appointments/patient/book" },
      { method: "GET", path: "/api/appointments/my" },
      { method: "GET", path: "/api/appointments/my/:id" },
      { method: "PUT", path: "/api/appointments/my/:id" },
      { method: "PATCH", path: "/api/appointments/my/:id/cancel" },
      { method: "GET", path: "/api/health-records/me" },
    ],
  },
];

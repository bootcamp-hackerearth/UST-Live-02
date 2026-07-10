const ROLES = require("./roles");

const api = (method, path, roles) => ({
  method,
  path,
  ...(roles ? { roles } : {}),
});

const adminReception = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.RECEPTIONIST];
const adminsOnly = [ROLES.SUPER_ADMIN, ROLES.ADMIN];
const superAdminOnly = [ROLES.SUPER_ADMIN];

module.exports = [
  //dashboards
  {
    name: "Admin Dashboard",
    path: "/dashboard/admin",
    icon: "dashboard",
    order: 1,
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    apiPermissions: [
      api("GET", "/api/dashboard/admin-stats"),
      api("GET", "/api/dashboard/recent-employees"),
      api("POST", "/api/nodes"),
      api("PUT", "/api/nodes/:id"),
      api("DELETE", "/api/nodes/:id"),
    ],
  },
  {
    name: "Doctor Dashboard",
    path: "/dashboard/doctor",
    icon: "dashboard",
    order: 2,
    roles: [ROLES.DOCTOR],
    apiPermissions: [
      api("GET", "/api/dashboard/doctor-stats"),
      api("GET", "/api/dashboard/today-appointments"),
    ],
  },
  {
    name: "Receptionist Dashboard",
    path: "/dashboard/receptionist",
    icon: "dashboard",
    order: 3,
    roles: [ROLES.RECEPTIONIST],
    apiPermissions: [
      api("GET", "/api/dashboard/receptionist-stats"),
      api("GET", "/api/dashboard/today-appointments"),
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
      api("GET", "/api/employees"),
      api("GET", "/api/employees/doctors"),
      api("GET", "/api/employees/:id"),
      api("PUT", "/api/employees/:id"),
      api("PATCH", "/api/employees/:id/activate"),
      api("PATCH", "/api/employees/:id/deactivate"),
      api("DELETE", "/api/employees/:id"),
    ],
  },
  {
    name: "Patients",
    path: "/patients",
    icon: "people",
    order: 20,
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR],
    apiPermissions: [
      api("GET", "/api/patients"),
      api("GET", "/api/patients/:id"),
      api("PUT", "/api/patients/:id", adminReception),
      api("DELETE", "/api/patients/:id", adminsOnly),
    ],
  },
  {
    name: "Appointments",
    path: "/appointments",
    icon: "event",
    order: 30,
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR],
    apiPermissions: [
      api("GET", "/api/appointments"),
      api("GET", "/api/appointments/available-slots"),
      api("GET", "/api/employees/doctors"),
      api("GET", "/api/appointments/:id"),
      api("PUT", "/api/appointments/:id", adminReception),
      api("DELETE", "/api/appointments/:id", adminReception),
    ],
  },
  {
    name: "Health Records",
    path: "/health-records",
    icon: "folder_shared",
    order: 40,
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR],
    apiPermissions: [
      api("GET", "/api/health-records"),
      api("GET", "/api/health-records/:patientId"),
      api("POST", "/api/health-records/:patientId/lab-reports"),
      api("PUT", "/api/health-records/:patientId/lab-reports/:reportId"),
      api("DELETE", "/api/health-records/:patientId/lab-reports/:reportId", adminsOnly),
      api("POST", "/api/health-records/:patientId/medical-documents"),
      api("PUT", "/api/health-records/:patientId/medical-documents/:documentId"),
      api("DELETE", "/api/health-records/:patientId/medical-documents/:documentId", adminsOnly),
      api("GET", "/api/consultations"),
      api("GET", "/api/consultations/appointment/:appointmentId"),
      api("GET", "/api/consultations/:id"),
      api("GET", "/api/consultations/prescription/:consultationId"),
      api("DELETE", "/api/consultations/:id", adminsOnly),
    ],
  },
  {
    name: "Doctor Queue",
    path: "/doctor-queue",
    icon: "queue",
    order: 50,
    roles: [ROLES.DOCTOR],
    apiPermissions: [
      api("GET", "/api/appointments/doctor-queue"),
      api("POST", "/api/consultations"),
      api("PUT", "/api/consultations/:id"),
    ],
  },
  {
    name: "Doctor Availability",
    path: "/doctor-availability",
    icon: "schedule",
    order: 60,
    roles: [ROLES.DOCTOR],
    apiPermissions: [
      api("GET", "/api/employees/doctor/availability"),
      api("PATCH", "/api/employees/doctor/availability"),
    ],
  },
  {
    name: "Node Management",
    path: "/node-management",
    icon: "account_tree",
    order: 90,
    roles: [ROLES.SUPER_ADMIN],
    apiPermissions: [
      api("GET", "/api/nodes", superAdminOnly),
      api("POST", "/api/nodes", superAdminOnly),
      api("PUT", "/api/nodes/:id", superAdminOnly),
      api("DELETE", "/api/nodes/:id", superAdminOnly),
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
      api("GET", "/api/patients/profile"),
      api("PUT", "/api/patients/profile"),
      api("GET", "/api/patients/dashboard"),
      api("GET", "/api/appointments/available-slots"),
      api("GET", "/api/employees/doctors"),
      api("POST", "/api/appointments/patient/book"),
      api("GET", "/api/appointments/my"),
      api("GET", "/api/appointments/my/:id"),
      api("PUT", "/api/appointments/my/:id"),
      api("PATCH", "/api/appointments/my/:id/cancel"),
      api("GET", "/api/health-records/me"),
    ],
  },
];

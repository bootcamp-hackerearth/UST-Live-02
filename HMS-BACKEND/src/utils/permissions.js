const permissions = {
  DASHBOARD: ["Owner", "Admin"],

  ADD_PATIENT: ["Owner", "Admin", "Receptionist"],
  VIEW_PATIENT: ["Owner", "Admin", "Receptionist", "Doctor"],
  UPDATE_PATIENT: ["Owner", "Admin", "Receptionist"],
  DELETE_PATIENT: ["Owner", "Admin"],

  ADD_EMPLOYEE: ["Owner", "Admin"],
  VIEW_EMPLOYEE: ["Owner", "Admin"],
  UPDATE_EMPLOYEE: ["Owner", "Admin"],
  DELETE_EMPLOYEE: ["Owner", "Admin"],

  ADD_DOCTOR: ["Owner", "Admin"],
  VIEW_DOCTOR: ["Owner", "Admin", "Receptionist", "Doctor", "Patient"],
  UPDATE_DOCTOR: ["Owner", "Admin"],
  DELETE_DOCTOR: ["Owner", "Admin"],

  ADD_APPOINTMENT: ["Owner", "Admin", "Receptionist", "Patient"],
  VIEW_APPOINTMENT: ["Owner", "Admin", "Receptionist", "Doctor", "Patient"],
  CANCEL_APPOINTMENT: ["Owner", "Admin", "Receptionist", "Patient"],
  UPDATE_APPOINTMENT: ["Owner", "Admin", "Receptionist", "Doctor"],

  ADD_HEALTH_RECORD: ["Owner", "Admin", "Receptionist", "Doctor"],
  VIEW_HEALTH_RECORD: ["Owner", "Admin", "Receptionist", "Doctor", "Patient"],
  UPDATE_HEALTH_RECORD: ["Owner", "Admin", "Receptionist", "Doctor"],
  FINALIZE_HEALTH_RECORD: ["Doctor"],
  DELETE_HEALTH_RECORD: ["Owner", "Admin", "Doctor"],

  APPROVE_EMPLOYEE: ["Owner", "Admin"],
  PENDING_APPROVE_EMPLOYEE: ["Owner", "Admin"],
};

module.exports = permissions;

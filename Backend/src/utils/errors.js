const AppError = require("./appError");

const ERR = {
  emailExists: () => new AppError("Email is already registered", 409),
  phoneExists: () => new AppError("Phone number is already registered", 409),
  medicalRegistrationExists: () =>
    new AppError("Medical registration number already exists", 409),
  menuNodePathExists: () =>
    new AppError("Menu node path already exists", 409),

  userNotFound: () => new AppError("User not found", 404),
  employeeNotFound: () => new AppError("Employee not found", 404),
  patientNotFound: () => new AppError("Patient not found", 404),
  doctorNotFound: () => new AppError("Doctor not found", 404),
  appointmentNotFound: () => new AppError("Appointment not found", 404),
  consultationNotFound: () => new AppError("Consultation not found", 404),
  menuNodeNotFound: () => new AppError("Menu node not found", 404),
  healthRecordNotFound: () => new AppError("Health record not found", 404),

  invalidCredentials: () => new AppError("Invalid email or password", 401),
  invalidToken: () => new AppError("Invalid or expired token", 401),
  tokenRequired: () => new AppError("Authorization token is required", 401),
  accessDenied: () => new AppError("Access denied", 403),

  invalidPatientId: () => new AppError("Invalid patient ID", 400),
  invalidEmployeeId: () => new AppError("Invalid employee ID", 400),
  invalidAppointmentId: () => new AppError("Invalid appointment ID", 400),
  invalidConsultationId: () => new AppError("Invalid consultation ID", 400),
  invalidMenuNodeId: () => new AppError("Invalid menu node ID", 400),
  invalidHealthRecordId: () => new AppError("Invalid health record ID", 400),

  pastAppointmentDate: () =>
    new AppError("Cannot book appointment for past dates", 422),

  slotAlreadyBooked: () =>
    new AppError("Selected slot already booked", 409),

  patientAlreadyHasAppointment: () =>
    new AppError("Patient already has an appointment at this time", 409),

doctorUnavailable: () =>
    new AppError("Doctor is currently unavailable", 409),

invalidDoctorAvailability: () =>
  new AppError("Doctor availability end time must be after start time", 400),

  doctorNotJoined: (joiningDate) =>
    new AppError(
      `Appointments can be booked only from doctor's joining date (${joiningDate})`,
      409
    ),

  doctorNotAvailableOnDay: (day) =>
    new AppError(`Doctor is not available on ${day}`, 409),

  validationFailed: () => new AppError("Validation failed", 400),

  internalServer: () => new AppError("Internal server error", 500),
 invalidAuthorizationFormat: () =>
  new AppError("Invalid authorization format", 401),

unauthorized: () => new AppError("Unauthorized", 403),

accountNotFoundWithEmail: () =>
  new AppError("No account found with the provided email address", 404),

passwordRecoveryNotSet: () =>
  new AppError("Password recovery is not set up for this account", 400),

incorrectSecurityAnswer: () =>
  new AppError("Security answer is incorrect", 401),

samePassword: () =>
  new AppError("Last password and new password cant be same", 409),

refreshTokenRequired: () =>
  new AppError("Refresh token is required", 401),

refreshTokenInvalid: () =>
  new AppError("Refresh token expired or invalid", 401),

invalidRefreshToken: () =>
  new AppError("Invalid refresh token", 401),

appointmentNotFoundById: () =>
  new AppError("Appointment not found for the provided ID", 404),

appointmentDatePast: () =>
  new AppError("Appointment date cannot be in the past", 422),

timeSlotAlreadyBooked: () =>
  new AppError("Selected time slot is already booked", 409),

invalidLoginId: () => new AppError("Invalid login ID", 401),

passwordAlreadyCreated: () =>
  new AppError("Password is already created for this account", 409),

invalidTemporaryPassword: () =>
  new AppError("Invalid temporary password", 401),

userProfileNotFound: () =>
  new AppError("User profile not found", 404),

accountPendingApproval: () =>
  new AppError("Your account is pending admin approval", 403),

registrationRejected: () =>
  new AppError("Your registration was rejected", 403),

accountInactive: () =>
  new AppError("Account is inactive", 403),

invalidDesignation: () =>
  new AppError("Invalid designation", 400),

appointmentApprovalConflict: () =>
  new AppError("Only pending appointments can be approved", 409),

appointmentRejectConflict: () =>
  new AppError("Only pending appointments can be rejected", 409),

appointmentCancelConflict: () =>
  new AppError("Appointment cannot be cancelled", 409),

doctorAndDateRequired: () =>
  new AppError("Doctor ID and appointment date are required", 400),

cannotSelectPastDates: () =>
  new AppError("Cannot select past dates", 422),

doctorBreakTime: () =>
  new AppError("Selected slot falls during doctor break time", 409),

doctorPatientLimitReached: () =>
  new AppError("Maximum patient limit reached for this doctor", 409),

unauthorizedAccess: () =>
  new AppError("Unauthorized access", 403),

appointmentModifyConflict: () =>
  new AppError("Only pending appointments can be modified", 409),

pastDateNotAllowed: () =>
  new AppError("Past date not allowed", 422),

futureDateOfBirth: () =>
  new AppError("Date of Birth cannot be in the future", 422),

userEmailExists: () =>
  new AppError("User with this email already exists", 409),

emailAlreadyRegistered: () =>
  new AppError("Email already registered", 409),

phoneAlreadyRegistered: () =>
  new AppError("Phone number already registered", 409),
consultationAlreadyExists: () =>
  new AppError("Consultation already exists", 409),

employeeAccountNotFound: () =>
  new AppError("Employee account not found", 404),

consultationFeeRequired: () =>
  new AppError("Consultation fee is required for doctors", 400),

employeeEmailExists: () =>
  new AppError("Employee already exists with this email", 409),

employeePhoneExists: () =>
  new AppError("Employee already exists with this phone number", 409),

userAccountNotFound: () =>
  new AppError("User account not found", 404),
};

module.exports = ERR;

// Shared shapes returned by the HMS backend patient API.

export type Address = {
  houseName: string;
  houseNumber: string;
  city: string;
  postCode: string;
};

export type EmergencyContact = {
  contactName: string;
  relationship: string;
  contactNumber: string;
};

export type Patient = {
  UHID: string;
  name: string;
  phone: string;
  email: string;
  gender: "Male" | "Female";
  dob: string;
  address: Address;
  emergencyContact: EmergencyContact;
  status: "ACTIVE" | "INACTIVE";
};

export type AvailabilitySlot = {
  day:
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY"
    | "SUNDAY";
  startTime: string;
  endTime: string;
};

export type Doctor = {
  employeeCode: string;
  name: string;
  specialization?: string;
  department?: string;
  consultationFee?: number;
  availabilitySlots?: AvailabilitySlot[];
  qualification?: string[];
  joiningDate?: string;
  // Date on/after which this doctor accepts no new appointments
  bookingCutoffDate?: string;
};

export type AppointmentStatus =
  | "BOOKED"
  | "CANCELED"
  | "COMPLETED"
  | "UNATTENDED";

export type MedicalRecordStatus = "DRAFT" | "FINALIZED";

export type PrescriptionItem = {
  name: string;
  dosage: string;
  duration: string;
};

// Full medical record (detail responses)
export type MedicalRecord = {
  medicalRecordId: string;
  appointmentId: string;
  patientId: string;
  patientUHID: string;
  patientName: string;
  doctorEmployeeId: string;
  doctorName: string;
  symptoms: string;
  diagnosis: string;
  prescriptionItems: PrescriptionItem[];
  // notes are internal/clinician-only and are never sent to the patient app
  status: MedicalRecordStatus;
  created_at?: string;
};

// Summary row shown in the patient's medical records list
export type MedicalRecordListItem = {
  medicalRecordId: string;
  appointmentId: string;
  doctorName: string;
  status: MedicalRecordStatus;
  created_at?: string;
};

export type Appointment = {
  appointmentId: string;
  patientId: string;
  doctorEmployeeId: string;
  appointmentDate: string;
  timeSlot: string;
  status: AppointmentStatus;
  cancellationReason?: string;
  patient?: { UHID: string; name: string; phone: string; email: string } | null;
  doctor?: {
    employeeCode: string;
    name: string;
    specialization?: string;
    department?: string;
    consultationFee?: number;
  } | null;
};

export type RegisterPayload = {
  name: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender: "Male" | "Female";
  dob: string;
  address: Address;
  emergencyContact: EmergencyContact;
};

export type ProfileUpdatePayload = {
  phone?: string;
  email?: string;
  address?: Address;
  emergencyContact?: EmergencyContact;
};

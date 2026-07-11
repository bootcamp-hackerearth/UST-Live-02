export type HealthRecordStatus = 'DRAFT' | 'FINALIZED';

export interface PrescriptionMedicine {
  name: string;
  dosage: string;
  duration: string;
  notes?: string;
}

export interface HealthRecordPatient {
  _id: string;
  UHID?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  gender?: string;
  dob?: string;
}

export interface HealthRecordDoctorUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface HealthRecordDoctorEmployee {
  _id: string;
  employeeCode?: string;
  department?: string;
  designation?: string;
  userId?: HealthRecordDoctorUser;
}

export interface HealthRecordDoctor {
  _id: string;
  employeeId?: HealthRecordDoctorEmployee;
}

export interface HealthRecordAppointment {
  _id: string;
  appointmentCode?: string;
  appointmentDate?: string;
  timeSlot?: string;
  status?: string;
  reason?: string;
}

export interface HealthRecord {
  _id: string;
  medicalRecordId?: string;

  appointmentId?: HealthRecordAppointment;
  patientId?: HealthRecordPatient;
  doctorId?: HealthRecordDoctor;

  symptomsReason?: string;
  diagnosis?: string;
  prescription?: PrescriptionMedicine[];
  notes?: string;

  status: HealthRecordStatus;
  finalizedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface HealthRecordListResponse {
  success: boolean;
  message?: string;
  data: HealthRecord[];
  pagination?: {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface HealthRecordSingleResponse {
  success: boolean;
  message?: string;
  data: HealthRecord;
}
import { PaginationData } from './pagination.model';

export interface PrescriptionMedicine {
  name: string;
  dosage: string;
  duration: string;
  notes?: string;
}

export type HealthRecordStatus = 'DRAFT' | 'FINALIZED';

export interface HealthRecordPatient {
  _id: string;
  UHID?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  gender?: string;
  dob?: string;
}

export interface HealthRecordUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface HealthRecordEmployee {
  _id: string;
  employeeCode?: string;
  department?: string;
  designation?: string;
  userId?: HealthRecordUser;
}

export interface HealthRecordAppointment {
  _id: string;
  appointmentCode?: string;
  appointmentDate?: string;
  timeSlot?: string;
  doctorId?: HealthRecordDoctor;
  status?: 'BOOKED' | 'CANCELLED' | 'COMPLETED';
  reason?: string;
}

export interface HealthRecord {
  _id: string;
  medicalRecordId?: string;

  appointmentId?: string | HealthRecordAppointment;
  patientId?: string | HealthRecordPatient;
  doctorId?: string | HealthRecordDoctor;

  symptomsReason?: string;
  diagnosis: string;
  prescription: PrescriptionMedicine[];
  notes?: string;

  status: HealthRecordStatus;

  finalizedAt?: string | null;
  finalizedBy?: string | HealthRecordEmployee | null;

  createdBy?: string | HealthRecordEmployee;
  createdAt?: string;
  updatedAt?: string;

  isDeleted?: boolean;
  deletedAt?: string | null;
  deletedBy?: string | null;
}

export interface CreateHealthRecordRequest {
  appointmentId: string;
  diagnosis: string;
  prescription: PrescriptionMedicine[];
  notes?: string;
}

export interface UpdateHealthRecordRequest {
  diagnosis: string;
  prescription: PrescriptionMedicine[];
  notes?: string;
}

export interface HealthRecordListResponse {
  success: boolean;
  data: HealthRecord[];
  pagination: PaginationData;
  message?: string;
}

export interface HealthRecordSingleResponse {
  success: boolean;
  data: HealthRecord;
  message?: string;
}

export interface HealthRecordDoctor {
  _id: string;
  employeeId?: HealthRecordEmployee;
}

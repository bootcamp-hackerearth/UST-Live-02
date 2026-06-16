import { ApiResponse, PaginatedData } from './api-response.model';

// Medical record domain models aligned with the backend MedicalRecords schema

export type MedicalRecordStatus = 'DRAFT' | 'FINALIZED';

export const MEDICAL_RECORD_STATUSES: MedicalRecordStatus[] = [
  'DRAFT',
  'FINALIZED',
];

// A single prescription line item
export interface PrescriptionItem {
  name: string;
  dosage: string;
  duration: string;
}

// Full medical record (detail / create / update responses)
export interface MedicalRecord {
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
  notes?: string;
  status: MedicalRecordStatus;
  createdByEmployeeId?: string;
  createdByName?: string;
  createdByDesignation?: string;
  created_at?: string;
  updated_at?: string;
}

// Summary row shown in list views
export interface MedicalRecordListItem {
  medicalRecordId: string;
  patientUHID: string;
  patientName: string;
  doctorEmployeeId: string;
  doctorName: string;
  appointmentId: string;
  status: MedicalRecordStatus;
  created_at?: string;
}

// Search/list filters (partial match)
export interface MedicalRecordFilters {
  patientUHID?: string;
  patientName?: string;
  doctorEmployeeId?: string;
  doctorName?: string;
  appointmentId?: string;
  status?: string;
}

// Payload to create a medical record
export interface CreateMedicalRecordPayload {
  appointmentId: string;
  symptoms: string;
  diagnosis: string;
  prescriptionItems: PrescriptionItem[];
  notes?: string;
  status: MedicalRecordStatus;
}

// Payload to update a medical record (partial fields + optional status transition)
export interface UpdateMedicalRecordPayload {
  symptoms?: string;
  diagnosis?: string;
  prescriptionItems?: PrescriptionItem[];
  notes?: string;
  status?: MedicalRecordStatus;
}

// GET /medical-records response
export interface MedicalRecordsData extends PaginatedData {
  medicalRecords: MedicalRecordListItem[];
}
export type MedicalRecordsResponse = ApiResponse<MedicalRecordsData>;

// Single-record response (also used by /by-appointment, where medicalRecord may be null)
export type MedicalRecordResponse = ApiResponse<{
  medicalRecord: MedicalRecord | null;
}>;

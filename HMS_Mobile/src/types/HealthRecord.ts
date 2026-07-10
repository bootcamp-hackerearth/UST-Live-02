export interface PaginationMeta {
  limit: number;
  nextCursor?: string | null;
  hasNextPage: boolean;
  page?: number;
  totalRecords?: number;
  totalPages?: number;
}

export interface HealthRecordMeta {
  consultations: PaginationMeta;
  labReports: PaginationMeta;
  medicalDocuments: PaginationMeta;
}

export interface HealthRecordPatient {
  _id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  gender?: string;
  bloodGroup?: string;
  phone?: string;
}
export interface ConsultationDoctor {
  _id: string;
  name: string;
  department?: string;
  specialization?: string;
}

export interface Vitals {
  bloodPressure?: string;
  pulseRate?: number;
  oxygenLevel?: number;
  temperature?: number;
  weight?: number;
}

export interface Consultation {
  _id: string;

  appointmentId: string;

  diagnosis?: string;

  symptoms: string[];

  doctorNotes?: string;

  vitals?: Vitals;

  status: "IN_PROGRESS" | "COMPLETED";

  createdAt: string;

  followUpDate?: string;

  doctorEmployeeId?: ConsultationDoctor;

  prescriptions: Prescription[];
}
export interface LabReport {
  _id: string;
  title: string;
  reportType: string;
  reportDate: string;
  documentUrl?: string;
  labName?: string;
  doctorName?: string;
}

export interface MedicalDocument {
  _id: string;
  title: string;
  documentType: string;
  recordDate?: string;
  documentUrl?: string;
  hospitalName?: string;
  doctorName?: string;
}
export interface Prescription {
  _id?: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
}
export interface PrescriptionGroup {
  consultationId: string;

  doctor?: string;

  department?: string;

  specialization?: string;

  date: string;

  diagnosis?: string;

  symptoms: string[];

  doctorNotes?: string;

  vitals?: Vitals;

  prescriptions: Prescription[];
}

export interface HealthRecordDetails {
  patient: HealthRecordPatient;

  consultations: Consultation[];

  labReports: LabReport[];

  medicalDocuments: MedicalDocument[];

  meta: HealthRecordMeta;
}

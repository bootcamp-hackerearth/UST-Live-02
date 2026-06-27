export interface Patient {
  patientId: string;
  UHID: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  gender: string;
  dob: string;
  bloodGroup: string;
  city?: string;
  state?: string;
  pincode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  createdByName: string;
  createdByEmail?: string;
  createdByRole?: string;
  createdByRoleCode?: string;
  createdAt: string;
}

export interface PatientAddress {
  city: string;
  state: string;
  pincode: string;
}

export interface CreatePatientPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
  bloodGroup: string;
  address: PatientAddress;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export interface CreatePatientResult {
  patientId: string;
  userId: string;
  email: string;
  credentialsEmailSent: boolean;
}
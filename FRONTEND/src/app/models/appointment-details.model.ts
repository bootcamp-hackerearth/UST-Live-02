import { HealthRecord } from './health-record.model';

export interface AppointmentDetailsPatient {
  _id: string;
  UHID?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  gender?: string;
  dob?: string;
}

export interface AppointmentDetailsUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface AppointmentDetailsEmployee {
  _id: string;
  employeeCode?: string;
  department?: string;
  designation?: string;
  userId?: AppointmentDetailsUser;
}

export interface AppointmentDetailsDoctor {
  _id: string;
  specialization?: string;
  qualification?: string;
  consultationFee?: number;
  employeeId?: AppointmentDetailsEmployee;
  userId?: AppointmentDetailsUser;
  department?: string;
  designation?: string;
}

export interface AppointmentDetails {
  _id: string;
  appointmentCode?: string;
  patientId?: AppointmentDetailsPatient;
  doctorId?: AppointmentDetailsDoctor;
  appointmentDate?: string;
  timeSlot?: string;
  status?: 'BOOKED' | 'CANCELLED' | 'COMPLETED';
  reason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppointmentDetailsResponse {
  success: boolean;
  data: {
    appointment: AppointmentDetails;
    healthRecord: HealthRecord | null;
  };
  message?: string;
}
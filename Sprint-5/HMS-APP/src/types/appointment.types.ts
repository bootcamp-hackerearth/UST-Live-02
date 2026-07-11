// src/types/appointment.types.ts

export interface AppointmentPatient {
  _id: string;
  UHID?: string;
  uhid?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  gender?: string;
}

export interface AppointmentDoctorUser {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface AppointmentDoctorEmployee {
  _id: string;
  employeeCode?: string;
  department?: string;
  designation?: string;
  joiningDate?: string;
  userId?: AppointmentDoctorUser;
}

export interface AppointmentDoctor {
  _id: string;
  doctorId?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  specialization?: string;
  qualification?: string;
  consultationFee?: number;
  availabilityStartTime?: string;
  availabilityEndTime?: string;

  joiningDate?:string;
  employeeId?: AppointmentDoctorEmployee;
}

export interface Appointment {
  _id: string;
  appointmentCode?: string;
  patientId?: AppointmentPatient;
  doctorId?: AppointmentDoctor;
  appointmentDate: string;
  timeSlot: string;
  status: 'BOOKED' | 'COMPLETED' | 'CANCELLED'|'UNATTENDED';
  reason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAppointmentPayload {
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  timeSlot: string;
  reason: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalRecords: number;
  hasNextPage: boolean;
}

export interface AppointmentsResponse {
  data: Appointment[];
  pagination: PaginationMeta;
}
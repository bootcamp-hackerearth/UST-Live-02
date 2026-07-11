

export interface Appointment {
  _id: string;
  appointmentCode: string;
  patientId: AppointmentPatient;
  doctorId: AppointmentDoctor;
  appointmentDate: string;
  timeSlot: string;
  status: string;
  reason: string;
  createdAt: string;
}

export interface AppointmentPatient {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  UHID: string;
  gender?: string;
  bloodGroup?: string;
}

export interface AppointmentDoctor {
  _id: string;
  employeeId: AppointmentDoctorEmployee;
  specialization?: string;
  qualification?: string;
  consultationFee?: number;
  medicalRegistrationNo?: string;
  availabilityStartTime?: string;
  availabilityEndTime?: string;
  experienceYears?: number;
}

export interface AppointmentDoctorEmployee {
  _id: string;
  employeeCode: string;
  department: string;
  designation: string;
  userId: AppointmentDoctorUser;
}

export interface AppointmentDoctorUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface CreateAppointmentPayload {
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  timeSlot: string;
  reason: string;
}

export interface SlotResponse {
  availabilityStart: string;
  availabilityEnd: string;

  totalSlots: number;
  bookedCount: number;

  allSlots: string[];
  bookedSlots: string[];
  availableSlots: string[];
}

export interface PaginationData {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedAppointmentResponse {
  success: boolean;
  statusCode?: number;
  message: string;
  data: Appointment[];
  pagination: PaginationData;
}
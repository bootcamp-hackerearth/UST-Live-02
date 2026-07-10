export type AppointmentStatus =
  | "BOOKED"
  | "CANCELLED"
  | "COMPLETED"
  | "IN_CONSULTATION"
  | "NO_SHOW";

export interface Doctor {
  _id: string;
  name: string;
  department?: string;
  specialization?: string;
}

export interface Appointment {
  _id: string;

  appointmentId?: string;

  appointmentDate: string;

  timeSlot: string;

  tokenNumber?: number;

  status: AppointmentStatus;

  appointmentType?: string;

  doctorEmployeeId?: Doctor;
}

export interface AppointmentMeta {
  limit: number;
  nextCursor?: string | null;
  hasNextPage: boolean;
  page?: number;
  totalRecords?: number;
  totalPages?: number;
}

export interface AppointmentResponse {
  data: Appointment[];
  meta: AppointmentMeta;
}

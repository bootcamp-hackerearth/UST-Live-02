export type AppointmentRecord = {
  _id: string;
  appointmentId?: string;
  appointmentDate?: string;
  timeSlot?: string;
  status?: string;
  reason?: string;
  symptoms?: string[];
  doctorEmployeeId?: {
    _id?: string;
    name?: string;
    department?: string;
    specialization?: string;
  };
  patientId?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
  };
};

export type AppointmentListParams = {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
};

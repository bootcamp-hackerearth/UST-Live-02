
export interface Doctor {
  doctorId: string;
  employeeId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  department: string;
  designation: string;
  joiningDate: string;
  specialization: string;
  qualification: string;
  consultationFee: number;
  medicalRegistrationNo: string;
  availabilityStartTime: string;
  availabilityEndTime: string;
  experienceYears: number;
  status: string;
  isVerified: boolean;
}

export interface CreateDoctorPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  department: string;
  designation: string;
  joiningDate: string;
  specialization: string;
  qualification: string;
  consultationFee: number | null;
  medicalRegistrationNo: string;
  availabilityStartTime: string;
  availabilityEndTime: string;
  experienceYears: number | null;
}

export interface UpdateDoctorPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  department?: string;
  designation?: string;
  joiningDate?: string;
  status?: string;

  specialization?: string;
  qualification?: string;
  consultationFee?: number;
  medicalRegistrationNo?: string;
  availabilityStartTime?: string;
  availabilityEndTime?: string;
  experienceYears?: number;
}
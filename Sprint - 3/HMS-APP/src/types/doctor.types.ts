export interface Doctor {
  doctorId?: string;
  _id?: string;
  employeeId?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  specialization: string;
  qualification?: string;
  consultationFee?: number;
  availabilityStartTime?: string;
  availabilityEndTime?: string;
  experienceYears?: number;
}
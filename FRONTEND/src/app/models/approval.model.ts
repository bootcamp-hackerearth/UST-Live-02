export interface ApprovalRequest {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  designation: string;
  joiningDate: string;
  approvalStatus: string;
  isVerified: boolean;

  specialization?: string;
  qualification?: string;
  consultationFee?: number;
  medicalRegistrationNo?: string;
  availabilityStartTime?: string;
  availabilityEndTime?: string;
  experienceYears?: number;
}
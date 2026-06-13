export type UserModel = {
  name: string;
  email: string;
  status: string;
  role: string;
  employeeCode: string;
  isVerified: boolean;
  firstLogin: boolean;
  department: string;
  designation: string;
  joiningDate: Date;
  medicalRegistrationNo: string;
  specialization: string;
  qualification: string;
  consultationFee: number;
  availabilitySlots: string[];
};

export type PatientModel= {
  name: string,
  uhid: string,
  dob: string,
  gender: string,
  email: string,
  address: string,
  phone: string,
  emergencyContact: string,
  status: string,
  role: string,
  isVerified: string,
}


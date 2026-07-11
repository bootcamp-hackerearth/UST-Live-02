export interface RegisterPatientPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  gender: string;
  dob: string;
  bloodGroup: string;
  address: {
    city: string;
    state: string;
    pincode: string;
  };
  emergencyContactName: string;
  emergencyContactPhone: string;
}
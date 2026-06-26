export type LoginRequestModel = {
  email: string;
  password: string;
  isClientApp: boolean;
};

export type SignUpRequestModel = {
  name: string;
  email: string;
  role: string;
  status: string;
  password: string;
  phone: string;
  gender: string;
  address: string;
  bloodGroup: string;
  allergies: string;
  dob: Date;
  emergencyContact: string;
};

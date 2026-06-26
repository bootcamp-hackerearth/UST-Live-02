export type MedicalRecordModel = {
  medicalRecordId: string;
  patientId: string;
  appointmentId: string;
  doctorId: string;
  complaint: string;
  symptoms: string;
  diagnosis: string;
  medications: Medications[];
  medicalObservations: Observations[];
  notes: string;
  status: string;
  createdBy: string;
  created_at: Date;
  updatedBy: string;
  updateddAt: Date;
};

export type Medications = {
  name: string;
  dosage: string;
  duration: string;
  frequency: string;
};

export type Observations = {
  metricName: string;
  metricValue: string;
  recordedTime: Date;
};

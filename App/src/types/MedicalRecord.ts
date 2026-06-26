export type MedicalRecordTab = "PRESCRIPTIONS" | "HEALTH_RECORDS" | "LAB_REPORTS";

export type PaginationMeta = {
  page: number;
  limit?: number;
  totalRecords?: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
};

export type PrescriptionRecord = {
  _id: string;
  createdAt?: string;
  diagnosis?: string;
  doctorEmployeeId?: {
    name?: string;
    department?: string;
    specialization?: string;
  };
};

export type DocumentRecord = {
  _id: string;
  title?: string;
  documentType?: string;
  documentDate?: string;
  createdAt?: string;
  originalFileName?: string;
};

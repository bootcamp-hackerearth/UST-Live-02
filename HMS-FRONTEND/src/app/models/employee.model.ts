
export interface Employee {
  employeeId: string;
  userId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  roleCode: string;
  department: string;
  designation: string;
  joiningDate: string;
  isVerified: boolean;
  status: string;
}


export interface CreateEmployeePayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role: string;
  department: string;
  designation: string;
  joiningDate: string;
}
export interface UpdateEmployeePayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  department?: string;
  designation?: string;
  joiningDate?: string;
  status?: string;
}

export interface PaginationData {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedEmployeeResponse {
  success: boolean;
  statusCode?: number;
  message: string;
  data: Employee[];
  pagination: PaginationData;
}
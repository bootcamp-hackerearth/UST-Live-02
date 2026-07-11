export interface PaginationData {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  sortBy?: string;
  sortOrder?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  statusCode?: number;
  message: string;
  data: T[];
  pagination: PaginationData;
}
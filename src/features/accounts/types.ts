export type AccountItem = {
  id: string;
  bhBp: string;
  name: string;
  mobile: string;
  state: string;
  city: string;
  district?: string;
  status: "Active" | "Inactive" | string;
};

export type AccountPageResponse = {
  content: AccountItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type ApiResponse<T> = {
  success: boolean;
  status: number;
  message: string;
  data: T;
  path?: string;
  timestamp?: string;
};

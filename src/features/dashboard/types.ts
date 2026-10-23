export type DashboardData = {
  users?: number;
  linksShared?: number;
  assessmentTakenTrainer?: number;
  assessmentTakenSelf?: number;
  cities?: number;
  courses?: number;
  activeLanguages?: number;
  assessmentTakenTotal?: number;
  activeTrainers?: number;
  [key: string]: unknown;
};

export type DashboardApiResponse = {
  success: boolean;
  status: number;
  message: string;
  data: DashboardData;
  path?: string;
  timestamp?: string;
};

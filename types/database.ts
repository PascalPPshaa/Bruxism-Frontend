export interface Patient {
  telegram_id: string;
  name: string | null;
  birth: string | null;
  isRegistered: boolean | null;
  current_question_id: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: number; 
  question_text: string;
  scheduled_time: string; 
  is_active: boolean; 
  createdAt: string;
  updatedAt: string;
}

export interface SymptomLog {
  id: number; 
  telegram_id: string | null; 
  question_id: number | null; 
  answer: number;
  createdAt: string;
  updatedAt: string;
  patient?: {
    name: string;
  };
  question?: {
    id: number;
    question_text: string;
    scheduled_time: string;
  };
}


export interface DashboardStats {
  success: boolean;
  total_patients: number; 
}

export interface RecentLogsResponse {
  success: boolean;
  data: SymptomLog[]; 
}

export interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

export interface PatientDetailResponse {
  success: boolean;
  data: Patient & {
    symptomlogs: SymptomLog[];
  };
}
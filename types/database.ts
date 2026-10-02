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

// --- Bot Token Management (v3.0) ---
export type TokenHealthStatus =
  | 'active'
  | 'network_error'
  | 'invalid_token'
  | 'forbidden'
  | 'rate_limited'
  | 'api_error'
  | 'connection_error';

export interface BotToken {
  id: number;
  name: string;
  token_preview: string;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  available?: boolean;
  status?: TokenHealthStatus;
  error?: string | null;
}

export interface BotTokenUpdate {
  name?: string;
  is_active?: boolean;
  is_default?: boolean;
}

export interface TokenHealthSummary {
  total: number;
  healthy: number;
  unhealthy: number;
  statuses: Record<string, number>;
}

// --- Telegram Queue & Monitoring (v2.0-v3.0) ---
export interface QueueStats {
  enqueued: number;
  processed: number;
  failed: number;
  deduplicated: number;
  currentQueueSize: number;
  queueSizes: {
    high: number;
    normal: number;
    low: number;
    total: number;
  };
  rateLimiter: {
    totalSent: number;
    totalRetried: number;
    totalRateLimited: number;
    totalFailed: number;
  };
}

export interface CallbackStats {
  received: number;
  processed: number;
  failed: number;
  queued: number;
  currentQueueSize: number;
  peakQueueSize: number;
  avgProcessingTime: number;
  isProcessing: boolean;
}

// --- Scheduling Settings (v3.0) ---
export interface AutomatedConfig {
  questionsPerDay: number;
  startHour: number;
  endHour: number;
  timezone: string;
  minIntervalMinutes: number;
  maxQuestionsPerBatch: number;
}

export interface SchedulingMode {
  mode: 'manual' | 'automated';
}

export interface PreviewSchedule {
  question_id: number;
  scheduled_time: string;
  question_text: string;
}

// --- WebSocket Health Payload (v3.0) ---
export interface HealthPayload {
  timestamp: string;
  active_token: string;
  health: {
    available: boolean;
    status: TokenHealthStatus;
    bot_info: {
      id: number;
      first_name: string;
      username: string;
    } | null;
    diagnosis: string;
    recommended_action: string;
  };
  all_tokens: Array<{
    id: number;
    name: string;
    status: TokenHealthStatus;
    available: boolean;
  }>;
  queues: {
    outgoing: {
      currentQueueSize: number;
      processed: number;
      rateLimiter: {
        totalRateLimited: number;
      };
    };
    incoming: {
      currentQueueSize: number;
      processed: number;
      avgProcessingTime: number;
    };
  };
}
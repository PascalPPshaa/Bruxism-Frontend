import axios from 'axios';
import {
  Question,
  SymptomLog,
  PatientDetailResponse,
  BotTokenUpdate,
  AutomatedConfig,
} from '../types/database'; 


const baseURL = process.env.NEXT_PUBLIC_API_URL;

if (!baseURL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined at build time");
}


const api = axios.create({
  baseURL,
  headers: {
    'ngrok-skip-browser-warning': 'true',
  }
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  config.headers['ngrok-skip-browser-warning'] = '69420'; 
  
  return config;
});

// --- AUTH API ---
export const loginAdmin = (credentials: Record<string, string>) => api.post('/admin/login', credentials);

// --- DASHBOARD API (PROTECTED) ---
export const fetchDashboardStats = () => api.get('/admin/stats/count');
export const fetchRecentActivity = () => api.get('/admin/stats/recent');

// --- DATA API (PROTECTED) ---
export const getPatients = () => api.get('/patients');
export const deletePatient = (telegram_id: string) => api.delete(`/patients/${telegram_id}`);
export const getPatientDetail = (telegram_id: string) => api.get<PatientDetailResponse>(`/patients/${telegram_id}`);
export const getQuestions = () => api.get('/question');
export const createQuestion = (data: Partial<Question>) => api.post('/question', data);
export const updateQuestion = (id: number, data: Partial<Question>) => api.put(`/question/${id}`, data);
export const deleteQuestion = (id: number) => api.delete(`/question/${id}`);

export const getLogs = () => api.get<{ data: SymptomLog[] }>('/patients/');
export const getStatsCount = () => api.get('/admin/stats/count');
export const getRecentLogs = () => api.get('/admin/stats/recent');

export const getBotStatus = () => api.get('/admin/bot/status');

// --- TELEGRAM MONITORING API (v2.0-v3.0) ---
export const getQueueStats = () => api.get('/admin/telegram/queue-stats');
export const getRateLimiterStats = () => api.get('/admin/telegram/rate-limiter-stats');
export const getIncomingQueueStats = () => api.get('/admin/telegram/callback-queue-stats');
export const clearIncomingQueue = () => api.post('/admin/telegram/callback-queue-clear');
export const testBroadcast = (data: { count: number; message: string }) =>
  api.post('/admin/telegram/test-broadcast', data);

// --- BOT TOKEN MANAGEMENT API (v3.0) ---
export const getBotTokens = () => api.get('/admin/telegram/tokens');
export const createBotToken = (data: { token: string; name: string }) =>
  api.post('/admin/telegram/tokens', data);
export const updateBotToken = (id: number, data: Partial<BotTokenUpdate>) =>
  api.put(`/admin/telegram/tokens/${id}`, data);
export const deleteBotToken = (id: number) =>
  api.delete(`/admin/telegram/tokens/${id}`);
export const activateBotToken = (data: { token: string }) =>
  api.put('/admin/telegram/tokens/activate', data);
export const getBotTokensHealth = () => api.get('/admin/telegram/tokens/health');
export const getTokenHealth = (id: number) =>
  api.get(`/admin/telegram/tokens/${id}/health`);

// --- SCHEDULING SETTINGS API (v3.0) ---
export const getSchedulingMode = () => api.get('/admin/settings/scheduling-mode');
export const setSchedulingMode = (mode: 'manual' | 'automated') =>
  api.put('/admin/settings/scheduling-mode', { mode });
export const getAutomatedConfig = () => api.get('/admin/settings/automated-config');
export const setAutomatedConfig = (config: AutomatedConfig) =>
  api.put('/admin/settings/automated-config', config);
export const previewSchedule = () => api.get('/admin/settings/preview-schedule');
export const generateSchedule = () => api.post('/admin/settings/generate-schedule');

export default api;
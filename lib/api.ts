import axios from 'axios';
import { Question, SymptomLog, PatientDetailResponse } from '../types/database'; 


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

export default api;
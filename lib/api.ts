import axios from 'axios';
import { Question, SymptomLog, PatientDetailResponse } from '../types/database'; 

// const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL,
  
// });


const baseURL = process.env.NEXT_PUBLIC_API_URL;

if (!baseURL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined at build time");
}

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});


// --- AUTH API ---
export const loginAdmin = (credentials: Record<string, string>) => api.post('/admin/login', credentials);

// --- DASHBOARD API (PROTECTED) ---
export const fetchDashboardStats = () => api.get('/admin/stats/count');
export const fetchRecentActivity = () => api.get('/admin/stats/recent');

// --- DATA API (PROTECTED) ---
export const getPatients = () => api.get('/patients');
export const deletePatient = (phone: string) => api.delete(`/patients/${phone}`);
export const getPatientDetail = (phone: string) => api.get<PatientDetailResponse>(`/patients/${phone}`);
export const getQuestions = () => api.get('/question');
export const createQuestion = (data: Partial<Question>) => api.post('/question', data);
export const updateQuestion = (id: number, data: Partial<Question>) => api.put(`/question/${id}`, data);
export const deleteQuestion = (id: number) => api.delete(`/question/${id}`);

export const getLogs = () => api.get<SymptomLog[]>('/patients/logs'); 
export const getStatsCount = () => api.get('/admin/stats/count');
export const getRecentLogs = () => api.get('/admin/stats/recent');

export const getBotStatus = () => api.get('/admin/bot/status');

export default api;
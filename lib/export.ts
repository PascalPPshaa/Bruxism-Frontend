import * as XLSX from 'xlsx';
import { SymptomLog } from '@/types/database';

export function exportLogsToExcel(logs: SymptomLog[], filename: string, patientName?: string, patientNameMap?: Map<string, string>) {
  const data = logs.map(log => {
    const name = patientName 
      || (patientNameMap?.get(log.telegram_id || ''))
      || log.patient?.name 
      || 'Anonim';
    
    return {
      'Tanggal': new Date(log.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
      'Waktu': new Date(log.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      'Pasien': name,
      'Telegram ID': log.telegram_id || '-',
      'Pertanyaan': log.question?.question_text || '-',
      'Jawaban (Skala 1-5)': log.answer,
      'Tingkat Nyeri': Number(log.answer) >= 4 ? 'Tinggi' : Number(log.answer) >= 3 ? 'Sedang' : 'Rendah',
    };
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Log Gejala');

  ws['!cols'] = [
    { wch: 20 },
    { wch: 10 },
    { wch: 20 },
    { wch: 15 },
    { wch: 50 },
    { wch: 15 },
    { wch: 12 },
  ];

  XLSX.writeFile(wb, filename);
}

export function filterLogsByDateRange(logs: SymptomLog[], startDate: Date, endDate: Date): SymptomLog[] {
  return logs.filter(log => {
    const logDate = new Date(log.createdAt);
    return logDate >= startDate && logDate <= endDate;
  });
}
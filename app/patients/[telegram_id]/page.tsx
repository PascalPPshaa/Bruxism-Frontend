"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getPatientDetail } from '@/lib/api';
import { Patient, SymptomLog } from '@/types/database';
import { 
  User, Calendar, ClipboardList, Loader2, ArrowLeft, BarChart3, MessageSquare
} from 'lucide-react';
import Link from 'next/link';

export default function PatientDetailPage() {
  const { telegram_id } = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [symptomLogs, setSymptomLogs] = useState<SymptomLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (telegram_id) {
      fetchPatientDetail(telegram_id as string);
    }
  }, [telegram_id]);

  const fetchPatientDetail = async (id: string) => {
    try {
      const res = await getPatientDetail(id);
      setPatient(res.data.data);
      setSymptomLogs(res.data.data.symptomlogs || []);
    } catch (err) {
      console.error("Gagal mengambil detail pasien", err);
      setError("Gagal memuat data pasien. Pastikan Telegram ID benar.");
    } finally {
      setLoading(false);
    }
  };

  const getScaleColor = (answer: number) => {
    if (answer >= 4) return 'text-red-600 bg-red-50';
    if (answer >= 3) return 'text-orange-600 bg-orange-50';
    if (answer >= 2) return 'text-yellow-600 bg-yellow-50';
    return 'text-emerald-600 bg-emerald-50';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      <p className="text-slate-500 font-medium animate-pulse">Memuat detail pasien...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-4 text-center">
      <MessageSquare size={48} className="text-red-500" />
      <h2 className="text-xl font-bold text-red-700">Error</h2>
      <p className="text-slate-600">{error}</p>
      <Link href="/patients" className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:underline">
        <ArrowLeft size={16} /> Kembali ke Daftar Pasien
      </Link>
    </div>
  );

  if (!patient) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-4 text-center">
      <MessageSquare size={48} className="text-slate-400" />
      <h2 className="text-xl font-bold text-slate-700">Pasien Tidak Ditemukan</h2>
      <p className="text-slate-600">Data pasien dengan Telegram ID {telegram_id} tidak ditemukan.</p>
      <Link href="/patients" className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:underline">
        <ArrowLeft size={16} /> Kembali ke Daftar Pasien
      </Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10 px-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/patients" className="p-2 rounded-full hover:bg-slate-100 transition-colors">
          <ArrowLeft size={24} className="text-slate-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Detail Pasien</h1>
          <p className="text-slate-500 text-sm">Informasi lengkap dan riwayat gejala pasien.</p>
        </div>
      </div>

      {/* Patient Info */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
          <User size={24} className="text-blue-600" /> Informasi Pasien
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 text-slate-700">
          <p><span className="font-semibold">Telegram ID:</span> <span className="font-mono bg-slate-100 px-2 py-1 rounded text-sm">{patient.telegram_id}</span></p>
          <p><span className="font-semibold">Nama:</span> {patient.name || <span className="italic text-slate-400">Belum ada nama</span>}</p>
          <p><span className="font-semibold">Tanggal Lahir:</span> {patient.birth || <span className="italic text-slate-400">Tidak ada</span>}</p>
          <p><span className="font-semibold">Terdaftar:</span> {patient.isRegistered ? 'Ya' : 'Tidak'}</p>
          <p><span className="font-semibold">Dibuat:</span> {formatDate(patient.createdAt)}</p>
          <p><span className="font-semibold">Terakhir Update:</span> {formatDate(patient.updatedAt)}</p>
        </div>
      </div>

      {/* Symptom Logs */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
          <ClipboardList size={24} className="text-emerald-600" /> Riwayat Log Gejala
        </h3>
        {symptomLogs.length === 0 ? (
          <p className="text-slate-400 italic text-center py-4">Belum ada riwayat log gejala untuk pasien ini.</p>
        ) : (
          <div className="space-y-4">
            {symptomLogs.map((log) => (
              <div key={log.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-700 mb-1">
                    {log.question?.question_text || "Pertanyaan tidak diketahui"}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(log.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className={`px-4 py-2 rounded-xl font-black text-lg ${getScaleColor(log.answer)}`}>
                    {log.answer}
                  </div>
                  <span className="text-xs text-slate-400">Skala</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
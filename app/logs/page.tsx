"use client";
import React, { useEffect, useState } from 'react';
import { getLogs } from '@/lib/api';
import { SymptomLog } from '@/types/database';
import { ClipboardList, Search, Loader2, Calendar, User, BarChart3, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LogsPage() {
  const [logs, setLogs] = useState<SymptomLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await getLogs();
      setLogs(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (err) {
      console.error("Gagal mengambil data log", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = logs.filter(log => {
    const q = search.toLowerCase();
    return (
      log.telegram_id?.toLowerCase().includes(q) ||
      log.patient?.name?.toLowerCase().includes(q) ||
      log.question?.question_text?.toLowerCase().includes(q)
    );
  });

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
      <p className="text-slate-500 font-medium animate-pulse">Memuat log gejala...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10 px-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-600 rounded-lg text-white">
          <ClipboardList size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Log Gejala Pasien</h1>
          <p className="text-slate-500 text-sm">Riwayat jawaban skala gejala dari pasien Telegram.</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Cari log (Telegram ID, Nama, atau Pertanyaan)..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 shadow-sm"
        />
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map(scale => {
          const count = logs.filter(l => l.answer === scale).length;
          return (
            <div key={scale} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Skala {scale}</p>
              <p className="text-2xl font-black text-slate-900">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Logs List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-100 shadow-sm">
            <p className="text-slate-400 italic">
              {search ? "Log tidak ditemukan." : "Belum ada data log gejala."}
            </p>
          </div>
        ) : filtered.map((log) => (
          <div key={log.id} className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">
                      {log.patient?.name || "Pasien Anonim"}
                    </p>
                    <p className="text-xs text-slate-400 font-mono">{log.telegram_id}</p>
                  </div>
                </div>
                
                {log.question && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-600 italic">"{log.question.question_text}"</p>
                  </div>
                )}

                <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    {formatDate(log.createdAt)}
                  </div>
                </div>
              </div>

              <Link href={`/patients/${log.telegram_id}`}>
                <button className="inline-flex items-center gap-2 text-sm font-medium text-blue-500 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-xl transition-all">
                  Detail <ArrowRight size={16} />
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-slate-400">
        Total {filtered.length} dari {logs.length} log
      </p>
    </div>
  );
}
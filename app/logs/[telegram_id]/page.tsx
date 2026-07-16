'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPatientDetail } from '@/lib/api';
import { SymptomLog, Patient } from '@/types/database';
import { ArrowLeft, Calendar, MessageCircle, Scale, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function LogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const telegram_id = params.telegram_id as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [logs, setLogs] = useState<SymptomLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatientDetail();
  }, [telegram_id]);

  const fetchPatientDetail = async () => {
    try {
      const res = await getPatientDetail(telegram_id);
      if (res.data?.success && res.data?.data) {
        setPatient(res.data.data);
        setLogs(res.data.data.symptomlogs || []);
      }
    } catch (err) {
      console.error("Gagal mengambil data pasien", err);
    } finally {
      setLoading(false);
    }
  };

  const patientLogs = useMemo(() => {
    return [...logs].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [logs]);

  const patientName = patient?.name || 'Pasien';

  const getScaleStyle = (answer: number | string) => {
    const val = typeof answer === 'string' ? parseInt(answer) : answer;
    if (val >= 4) return { bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-800' };
    if (val >= 3) return { bg: 'bg-orange-100 dark:bg-orange-900/50', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800' };
    if (val >= 2) return { bg: 'bg-yellow-100 dark:bg-yellow-900/50', text: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-200 dark:border-yellow-800' };
    return { bg: 'bg-emerald-100 dark:bg-emerald-900/50', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' };
  };

  const getScaleEmoji = (answer: number | string) => {
    const val = typeof answer === 'string' ? parseInt(answer) : answer;
    if (val >= 4) return '😰';
    if (val >= 3) return '😟';
    if (val >= 2) return '😐';
    return '😊';
  };

  const getScaleLabel = (answer: number | string) => {
    const val = typeof answer === 'string' ? parseInt(answer) : answer;
    if (val >= 4) return 'Intensitas tinggi - perlu perhatian';
    if (val >= 3) return 'Intensitas sedang';
    return 'Intensitas rendah';
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
      <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Memuat chat...</p>
    </div>
  );

  return (
    <div className="pb-10 px-4 md:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-6"
      >
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center text-white font-bold shadow-md">
            {patientName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{patientName}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{telegram_id}</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-3 mb-6"
      >
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 text-center">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{patientLogs.length}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Total Pesan</p>
        </div>
        <div className="bg-red-50/80 dark:bg-red-950/50 backdrop-blur-xl p-4 rounded-2xl border border-red-200/60 dark:border-red-800/60 text-center">
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {patientLogs.filter(l => (typeof l.answer === 'string' ? parseInt(l.answer) : l.answer) >= 4).length}
          </p>
          <p className="text-xs text-red-600/80 dark:text-red-400/80">Tinggi</p>
        </div>
        <div className="bg-emerald-50/80 dark:bg-emerald-950/50 backdrop-blur-xl p-4 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/60 text-center">
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {patientLogs.filter(l => (typeof l.answer === 'string' ? parseInt(l.answer) : l.answer) < 3).length}
          </p>
          <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">Rendah</p>
        </div>
      </motion.div>

      {/* Chat Messages */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {patientLogs.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-12 text-center border border-slate-200/60 dark:border-slate-700/60"
            >
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-400 dark:text-slate-500">Belum ada chat untuk pasien ini.</p>
            </motion.div>
          ) : patientLogs.map((log, idx) => {
            const scaleStyle = getScaleStyle(log.answer);
            const answerVal = typeof log.answer === 'string' ? parseInt(log.answer) : log.answer;
            return (
              <motion.div
                key={log.id ?? idx}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
                className="relative"
              >
                {/* Date Divider */}
                {idx === 0 || new Date(log.createdAt).toDateString() !== new Date(patientLogs[idx - 1].createdAt).toDateString() ? (
                  <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-slate-200/60 dark:bg-slate-700/60" />
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                      {new Date(log.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                    <div className="flex-1 h-px bg-slate-200/60 dark:bg-slate-700/60" />
                  </div>
                ) : null}

                {/* Message Bubble */}
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-4 shadow-sm">
                  {/* Question */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {log.question?.question_text || 'Pertanyaan tidak tersedia'}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(log.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* Answer */}
                  <div className={`flex items-center gap-3 p-3 rounded-xl ${scaleStyle.bg} border ${scaleStyle.border}`}>
                    <span className="text-2xl">{getScaleEmoji(log.answer)}</span>
                    <div className="flex-1">
                      <p className={`font-semibold ${scaleStyle.text}`}>
                        Skala {answerVal} dari 5
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {getScaleLabel(log.answer)}
                      </p>
                    </div>
                    <Scale className={`w-5 h-5 ${scaleStyle.text} opacity-50`} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
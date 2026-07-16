'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { getLogs, getPatients, getPatientDetail } from '@/lib/api';
import { SymptomLog, Patient } from '@/types/database';
import { ClipboardList, Search, Loader2, Calendar, MessageCircle, ChevronRight, Download, FileSpreadsheet } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { exportLogsToExcel } from '@/lib/export';

interface GroupedLog {
  telegram_id: string;
  patientName: string;
  lastMessage: string;
  lastDate: string;
  totalLogs: number;
  severity: 'low' | 'medium' | 'high';
  logs: SymptomLog[];
}

export default function LogsPage() {
  const [logs, setLogs] = useState<SymptomLog[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState<'single' | 'all'>('single');
  const [exportPatientId, setExportPatientId] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const router = useRouter();

  const handleExportClick = (type: 'single' | 'all', patientId?: string) => {
    setExportType(type);
    setExportPatientId(patientId || '');
    setShowExportModal(true);
  };

  const handleExport = async () => {
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate + 'T23:59:59') : new Date();
    const dateRange = startDate || endDate 
      ? `_${startDate || 'awal'}_${endDate || 'akhir'}` 
      : '';
    
    try {
      if (exportType === 'all') {
        const registeredPatients = patients.filter(p => p.isRegistered === true);
        const allLogs: SymptomLog[] = [];
        
        for (const patient of registeredPatients) {
          if (!patient.telegram_id) continue;
          try {
            const res = await getPatientDetail(patient.telegram_id);
            const patientData = res.data.data;
            const logs = (patientData.symptomlogs || []).filter((log: SymptomLog) => {
              const logDate = new Date(log.createdAt);
              return logDate >= start && logDate <= end;
            });
            allLogs.push(...logs);
          } catch (err) {
            console.error(`Failed to fetch logs for ${patient.telegram_id}`, err);
          }
        }
        
        const nameMap = new Map(patients.filter(p => p.telegram_id && p.name).map(p => [p.telegram_id, p.name!]));
        const filename = `log_gejala_semua${dateRange}.xlsx`;
        exportLogsToExcel(allLogs, filename, undefined, nameMap);
      } else {
        const res = await getPatientDetail(exportPatientId);
        const patientData = res.data.data;
        const patientName = patientData.name || undefined;
        
        let logsToExport = patientData.symptomlogs || [];
        logsToExport = logsToExport.filter((log: SymptomLog) => {
          const logDate = new Date(log.createdAt);
          return logDate >= start && logDate <= end;
        });
        
        const filename = `log_gejala_${exportPatientId}${dateRange}.xlsx`;
        exportLogsToExcel(logsToExport, filename, patientName);
      }
    } catch (err) {
      console.error("Export failed", err);
    }
    setShowExportModal(false);
  };

  useEffect(() => {
    Promise.all([fetchLogs(), fetchPatients()]).finally(() => setLoading(false));
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await getLogs();
      setLogs(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (err) {
      console.error("Gagal mengambil data log", err);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await getPatients();
      setPatients(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (err) {
      console.error("Gagal mengambil data pasien", err);
    }
  };

  const patientNameMap = useMemo(() => {
    const map = new Map<string, string>();
    patients.forEach(p => {
      if (p.telegram_id && p.name) {
        map.set(p.telegram_id, p.name);
      }
    });
    return map;
  }, [patients]);

  const groupedLogs = useMemo(() => {
    const registeredIds = new Set(
      patients.filter(p => p.isRegistered === true).map(p => p.telegram_id)
    );

    const grouped = new Map<string, GroupedLog>();

    logs.forEach(log => {
      if (!log.telegram_id || !registeredIds.has(log.telegram_id)) return;

      const existing = grouped.get(log.telegram_id);
      const patientName = patientNameMap.get(log.telegram_id) || log.patient?.name || 'Pasien';

      if (existing) {
        existing.logs.push(log);
        existing.totalLogs++;
        if (new Date(log.createdAt) > new Date(existing.lastDate)) {
          existing.lastDate = log.createdAt;
          existing.lastMessage = log.question?.question_text || 'Pesan';
        }
        if (log.answer >= 4 && existing.severity !== 'high') {
          existing.severity = 'high';
        } else if (log.answer >= 3 && existing.severity === 'low') {
          existing.severity = 'medium';
        }
      } else {
        let severity: 'low' | 'medium' | 'high' = 'low';
        if (log.answer >= 4) severity = 'high';
        else if (log.answer >= 3) severity = 'medium';

        grouped.set(log.telegram_id, {
          telegram_id: log.telegram_id,
          patientName,
          lastMessage: log.question?.question_text || 'Pesan',
          lastDate: log.createdAt,
          totalLogs: 1,
          severity,
          logs: [log],
        });
      }
    });

    return Array.from(grouped.values()).sort(
      (a, b) => new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime()
    );
  }, [logs, patients, patientNameMap]);

  const filtered = groupedLogs.filter(g =>
    g.patientName.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Hari ini';
    if (days === 1) return 'Kemarin';
    if (days < 7) return `${days} hari lalu`;
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-950/20';
      case 'medium':
        return 'border-l-4 border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/20';
      default:
        return 'border-l-4 border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300';
      case 'medium':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300';
      default:
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300';
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
      <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Memuat log gejala...</p>
    </div>
  );

  return (
    <div className="space-y-6 pb-10 px-4 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="p-2.5 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-xl text-white shadow-lg shadow-sky-500/30">
          <ClipboardList size={24} />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Log Gejala</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Riwayat chat pasien terdaftar</p>
        </div>
        <button
          onClick={() => handleExportClick('all')}
          className="ml-auto flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium text-sm shadow-lg shadow-emerald-500/30 transition-all"
        >
          <FileSpreadsheet size={18} />
          <span className="hidden sm:inline">Export All</span>
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5" />
        <input
          type="text"
          placeholder="Cari nama pasien..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 rounded-2xl outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0"
      >
        <div className="flex-1 min-w-[100px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 text-center">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{groupedLogs.length}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Total Pasien</p>
        </div>
        <div className="flex-1 min-w-[100px] bg-red-50/80 dark:bg-red-950/50 backdrop-blur-xl p-4 rounded-2xl border border-red-200/60 dark:border-red-800/60 text-center">
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{groupedLogs.filter(g => g.severity === 'high').length}</p>
          <p className="text-xs text-red-600/80 dark:text-red-400/80">Tinggi</p>
        </div>
        <div className="flex-1 min-w-[100px] bg-orange-50/80 dark:bg-orange-950/50 backdrop-blur-xl p-4 rounded-2xl border border-orange-200/60 dark:border-orange-800/60 text-center">
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{groupedLogs.filter(g => g.severity === 'medium').length}</p>
          <p className="text-xs text-orange-600/80 dark:text-orange-400/80">Sedang</p>
        </div>
        <div className="flex-1 min-w-[100px] bg-emerald-50/80 dark:bg-emerald-950/50 backdrop-blur-xl p-4 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/60 text-center">
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{groupedLogs.filter(g => g.severity === 'low').length}</p>
          <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">Rendah</p>
        </div>
      </motion.div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-12 text-center border border-slate-200/60 dark:border-slate-700/60"
            >
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-400 dark:text-slate-500">
                {search ? "Pasien tidak ditemukan." : "Belum ada data log gejala."}
              </p>
            </motion.div>
          ) : filtered.map((group, idx) => (
            <div
              key={group.telegram_id}
              className={`p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm hover:shadow-lg transition-all ${getSeverityStyle(group.severity)}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {group.patientName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                      {group.patientName}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityBadge(group.severity)}`}>
                      {group.severity === 'high' ? 'Tinggi' : group.severity === 'medium' ? 'Sedang' : 'Rendah'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                    "{group.lastMessage}"
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(group.lastDate)}
                    </span>
                    <span>{group.totalLogs} pesan</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleExportClick('single', group.telegram_id); }}
                    className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-all"
                    title="Export"
                  >
                    <FileSpreadsheet size={16} />
                  </button>
                  <button
                    onClick={() => router.push(`/logs/${group.telegram_id}`)}
                    className="p-2 rounded-xl bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 hover:bg-sky-200 dark:hover:bg-sky-800 transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length > 0 && (
        <p className="text-center text-xs text-slate-400 dark:text-slate-500">
          Menampilkan {filtered.length} dari {groupedLogs.length} pasien
        </p>
      )}

      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700"
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <FileSpreadsheet className="text-emerald-500" size={20} />
              Export ke Excel
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              {exportType === 'all' ? 'Export semua log gejala pasien terdaftar' : 'Export log gejala pasien'}
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tanggal Mulai</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tanggal Akhir</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500">Kosongkan untuk export semua data</p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleExport}
                className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium text-sm shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2"
              >
                <Download size={16} />
                Export
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
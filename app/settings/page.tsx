"use client";
import { useEffect, useState, useCallback } from 'react';
import {
  getSchedulingMode,
  setSchedulingMode,
  getAutomatedConfig,
  setAutomatedConfig,
  previewSchedule,
  generateSchedule,
} from '@/lib/api';
import { AutomatedConfig, SchedulingMode, PreviewSchedule } from '@/types/database';
import { Timer, Save, RefreshCw, Play, Calendar, Clock, List, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

export default function SettingsPage() {
  const [mode, setMode] = useState<'manual' | 'automated'>('manual');
  const [config, setConfig] = useState<AutomatedConfig | null>(null);
  const [previewList, setPreviewList] = useState<PreviewSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      const [modeRes, configRes] = await Promise.all([
        getSchedulingMode(),
        getAutomatedConfig()
      ]);
      setMode(modeRes.data?.data?.mode || 'manual');
      setConfig(configRes.data?.data || null);
    } catch (err) {
      console.error('Gagal memuat pengaturan:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPreview = useCallback(async () => {
    try {
      const res = await previewSchedule();
      const list = res.data?.data?.schedule || res.data?.schedule || [];
      setPreviewList(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Gagal memuat preview jadwal:', err);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleModeChange = async (newMode: 'manual' | 'automated') => {
    try {
      setSaving(true);
      await setSchedulingMode(newMode);
      setMode(newMode);
      if (newMode === 'automated') {
        loadPreview();
      }
    } catch (err) {
      console.error('Gagal mengganti mode:', err);
      alert('Gagal mengganti mode scheduling.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!config) return;
    try {
      setSaving(true);
      await setAutomatedConfig(config);
      alert('Konfigurasi berhasil disimpan!');
      if (mode === 'automated') loadPreview();
    } catch (err) {
      console.error('Gagal menyimpan konfigurasi:', err);
      alert('Gagal menyimpan konfigurasi.');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateSchedule = async () => {
    try {
      setGenerating(true);
      const res = await generateSchedule();
      alert(res.data?.message || 'Jadwal berhasil digenerate!');
      loadPreview();
    } catch (err) {
      console.error('Gagal generate schedule:', err);
      alert('Gagal generate jadwal.');
    } finally {
      setGenerating(false);
    }
  };

  const updateConfigField = (field: keyof AutomatedConfig, value: string | number) => {
    if (!config) return;
    setConfig({ ...config, [field]: value });
  };

  return (
    <div className="p-4 md:p-8 min-h-screen">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-xl text-white shadow-lg shadow-sky-500/30">
            <Timer size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Pengaturan Jadwal</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Atur mode penjadwalan otomatis/manual untuk pertanyaan bruxism.</p>
          </div>
        </div>
        <button
          onClick={() => loadSettings()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100/80 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20 italic text-slate-400 dark:text-slate-500">
          Memuat pengaturan...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Mode Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-8"
          >
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <Timer size={20} className="text-sky-500" />
              Mode Penjadwalan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.button
                onClick={() => handleModeChange('manual')}
                disabled={saving}
                className={`p-6 rounded-2xl border-2 text-left transition-all ${
                  mode === 'manual'
                    ? 'border-sky-500 bg-sky-50/80 dark:bg-sky-950/50 dark:border-sky-400'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <p className={`font-bold text-lg mb-1 ${mode === 'manual' ? 'text-sky-600 dark:text-sky-400' : 'text-slate-800 dark:text-white'}`}>
                  Manual
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Atur jadwal pertanyaan per-pertanyaan secara manual.
                </p>
              </motion.button>
              <motion.button
                onClick={() => handleModeChange('automated')}
                disabled={saving}
                className={`p-6 rounded-2xl border-2 text-left transition-all ${
                  mode === 'automated'
                    ? 'border-sky-500 bg-sky-50/80 dark:bg-sky-950/50 dark:border-sky-400'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <p className={`font-bold text-lg mb-1 ${mode === 'automated' ? 'text-sky-600 dark:text-sky-400' : 'text-slate-800 dark:text-white'}`}>
                  Automated
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Sistem akan otomatis menyebarkan jadwal ke semua pertanyaan aktif.
                </p>
              </motion.button>
            </div>
          </motion.div>

          {/* Automated Config (only when automated mode) */}
          {mode === 'automated' && config && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-8"
            >
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                <Clock size={20} className="text-sky-500" />
                Konfigurasi Automated
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    Pertanyaan per Hari
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    className="w-full p-4 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl focus:ring-4 focus:ring-sky-500/10 outline-none font-medium text-slate-700 dark:text-slate-200"
                    value={config?.questionsPerDay ?? 20}
                    onChange={(e) => updateConfigField('questionsPerDay', parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-slate-400 dark:text-slate-500">1-50 pertanyaan per hari (rekomendasi: 20)</p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    Mulai Jam (WIB)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    className="w-full p-4 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl focus:ring-4 focus:ring-sky-500/10 outline-none font-medium text-slate-700 dark:text-slate-200"
                    value={config?.startHour ?? 8}
                    onChange={(e) => updateConfigField('startHour', parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    Selesai Jam (WIB)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    className="w-full p-4 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl focus:ring-4 focus:ring-sky-500/10 outline-none font-medium text-slate-700 dark:text-slate-200"
                    value={config?.endHour ?? 20}
                    onChange={(e) => updateConfigField('endHour', parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    Minimum Interval (menit)
                  </label>
                  <input
                    type="number"
                    min={15}
                    className="w-full p-4 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl focus:ring-4 focus:ring-sky-500/10 outline-none font-medium text-slate-700 dark:text-slate-200"
                    value={config?.minIntervalMinutes ?? 30}
                    onChange={(e) => updateConfigField('minIntervalMinutes', parseInt(e.target.value) || 15)}
                  />
                  <p className="text-xs text-slate-400 dark:text-slate-500">Minimal 15 menit antar pertanyaan</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <button
                  onClick={handleSaveConfig}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white py-3 px-6 rounded-2xl font-bold shadow-lg shadow-sky-500/30 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Save size={16} />
                  {saving ? 'Menyimpan...' : 'Simpan Konfigurasi'}
                </button>
                <button
                  onClick={handleGenerateSchedule}
                  disabled={generating}
                  className="flex items-center justify-center gap-2 bg-slate-100/80 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 py-3 px-6 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
                >
                  <Play size={16} className={generating ? 'animate-spin' : ''} />
                  {generating ? 'Menggenerate...' : 'Generate Jadwal Sekarang'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Preview Schedule (Automated mode only) */}
          {mode === 'automated' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Calendar size={20} className="text-sky-500" />
                  Preview Jadwal Hari Ini
                </h2>
                <button
                  onClick={loadPreview}
                  className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                >
                  <RefreshCw size={12} />
                  Refresh
                </button>
              </div>

              {previewList.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {previewList.map((item, idx) => (
                    <motion.div
                      key={item.question_id || idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="flex items-center justify-between p-4 bg-slate-50/80 dark:bg-slate-800/50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-sky-500/10 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm">
                          {item.question_id}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 max-w-md truncate">
                            {item.question_text}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-slate-400 dark:text-slate-500" />
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300 font-mono">
                          {item.scheduled_time?.substring(0, 5)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-400 dark:text-slate-500">
                  <List size={32} className="mx-auto mb-2 opacity-50" />
                  <p>Belum ada jadwal yang digenerate.</p>
                  <p className="text-xs mt-1">Klik "Generate Jadwal Sekarang" untuk memulai.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Alert Thresholds Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-8"
          >
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <AlertTriangle size={20} className="text-orange-500" />
              Alert Thresholds
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-50/80 dark:bg-slate-800/50 p-4 rounded-xl">
                <p className="font-bold text-slate-700 dark:text-slate-200 mb-2">Outgoing Queue</p>
                <ul className="text-slate-500 dark:text-slate-400 space-y-1">
                  <li>🟢 Normal: &lt; 50 pending</li>
                  <li>🟡 Warning: 50-200 pending</li>
                  <li>🔴 Critical: &gt; 200 pending</li>
                </ul>
              </div>
              <div className="bg-slate-50/80 dark:bg-slate-800/50 p-4 rounded-xl">
                <p className="font-bold text-slate-700 dark:text-slate-200 mb-2">Incoming Queue</p>
                <ul className="text-slate-500 dark:text-slate-400 space-y-1">
                  <li>🟢 Normal: &lt; 100 pending</li>
                  <li>🟡 Warning: 100-500 pending</li>
                  <li>🔴 Critical: &gt; 500 pending</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

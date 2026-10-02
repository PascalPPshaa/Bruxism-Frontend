"use client";
import { useEffect, useState, useCallback } from 'react';
import {
  getBotTokens,
  createBotToken,
  updateBotToken,
  deleteBotToken,
  activateBotToken,
  getBotTokensHealth,
} from '@/lib/api';
import { BotToken, TokenHealthStatus } from '@/types/database';
import {
  Bot, Plus, Edit2, Trash2, X, RefreshCw, CheckCircle2, AlertCircle, Power, Shield
} from 'lucide-react';
import { motion } from 'motion/react';

const HEALTH_STATUS_LABELS: Record<TokenHealthStatus, string> = {
  active: 'Aktif',
  network_error: 'Network Error',
  invalid_token: 'Token Invalid',
  forbidden: 'Forbidden',
  rate_limited: 'Rate Limited',
  api_error: 'API Error',
  connection_error: 'Connection Error',
};

const HEALTH_STATUS_COLORS: Record<TokenHealthStatus, string> = {
  active: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  invalid_token: 'bg-red-500/10 text-red-600 dark:bg-red-950/50 dark:text-red-400 border-red-200 dark:border-red-800',
  forbidden: 'bg-red-500/10 text-red-600 dark:bg-red-950/50 dark:text-red-400 border-red-200 dark:border-red-800',
  rate_limited: 'bg-orange-500/10 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400 border-orange-200 dark:border-orange-800',
  network_error: 'bg-yellow-500/10 text-yellow-600 dark:bg-yellow-950/50 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
  api_error: 'bg-yellow-500/10 text-yellow-600 dark:bg-yellow-950/50 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
  connection_error: 'bg-gray-500/10 text-gray-600 dark:bg-gray-950/50 dark:text-gray-400 border-gray-200 dark:border-gray-800',
};

export default function TelegramPage() {
  const [tokens, setTokens] = useState<BotToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [healthRefreshing, setHealthRefreshing] = useState(false);
  const [healthSummary, setHealthSummary] = useState<{ total: number; healthy: number; unhealthy: number } | null>(null);

  const [formData, setFormData] = useState({
    token: '',
    name: '',
    isActive: true,
  });

  const loadTokens = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getBotTokens();
      const list = res.data?.data || res.data || [];
      setTokens(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Gagal memuat token bot:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadHealthSummary = useCallback(async () => {
    try {
      const res = await getBotTokensHealth();
      if (res.data?.summary) {
        setHealthSummary(res.data.summary);
      }
    } catch (err) {
      console.error("Gagal memuat health summary:", err);
    }
  }, []);

  useEffect(() => {
    loadTokens();
    loadHealthSummary();
  }, [loadTokens, loadHealthSummary]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const updateData: { name?: string; is_active?: boolean } = {};
        if (formData.name) updateData.name = formData.name;
        if (editingId) {
          await updateBotToken(editingId, updateData);
        }
      } else {
        await createBotToken({ token: formData.token, name: formData.name });
      }
      closeModal();
      loadTokens();
    } catch (err) {
      alert("Gagal menyimpan token bot.");
    }
  };

  const openModal = (t?: BotToken) => {
    if (t) {
      setEditingId(t.id);
      setFormData({
        token: '',
        name: t.name,
        isActive: t.is_active,
      });
    } else {
      setEditingId(null);
      setFormData({ token: '', name: '', isActive: true });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ token: '', name: '', isActive: true });
  };

  const handleDelete = async (id: number) => {
    if (confirm("Hapus token bot ini secara permanen?")) {
      try {
        await deleteBotToken(id);
        loadTokens();
        loadHealthSummary();
      } catch (err) {
        alert("Gagal menghapus token.");
      }
    }
  };

  const handleActivate = async (token: string) => {
    try {
      await activateBotToken({ token });
      loadTokens();
      loadHealthSummary();
    } catch (err) {
      alert("Gagal mengaktifkan token.");
    }
  };

  const handleRefreshHealth = async () => {
    setHealthRefreshing(true);
    await loadTokens();
    await loadHealthSummary();
    setHealthRefreshing(false);
  };

  const getHealthColor = (status?: TokenHealthStatus) => {
    if (!status) return 'bg-gray-400';
    return HEALTH_STATUS_COLORS[status]?.split(' ')[0] || 'bg-gray-400';
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
            <Bot size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Manajemen Bot Telegram</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Kelola token bot Telegram, monitoring kesehatan, dan status real-time.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefreshHealth}
            disabled={healthRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100/80 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
          >
            <RefreshCw size={16} className={healthRefreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={() => openModal()}
            className="group bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-sky-500/30 active:scale-95"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
            <span className="font-bold">Tambah Bot</span>
          </button>
        </div>
      </motion.div>

      {/* Health Summary Cards */}
      {healthSummary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <motion.div
            className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-4 rounded-2xl border border-slate-200/50 dark:border-slate-700/50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Total Token</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{healthSummary.total}</p>
          </motion.div>
          <motion.div
            className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-4 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <p className="text-xs font-black uppercase tracking-widest text-emerald-500 dark:text-emerald-400 mb-2">Sehat</p>
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{healthSummary.healthy}</p>
          </motion.div>
          <motion.div
            className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-4 rounded-2xl border border-red-200/50 dark:border-red-800/50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-xs font-black uppercase tracking-widest text-red-500 dark:text-red-400 mb-2">Bermasalah</p>
            <p className="text-3xl font-black text-red-600 dark:text-red-400">{healthSummary.unhealthy}</p>
          </motion.div>
        </motion.div>
      )}

      {/* Token List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-20 italic text-slate-400 dark:text-slate-500">
            Memuat daftar bot...
          </div>
        ) : tokens.length > 0 ? (
          tokens.map((token, index) => (
            <motion.div
              key={token.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
              className="group relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-6 transition-all hover:shadow-xl hover:shadow-sky-500/10 hover:border-sky-200 dark:hover:border-sky-700"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                {/* Status Indicator */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className={`w-4 h-4 rounded-full ${getHealthColor(token.status)} border-2`}></div>
                  <Shield size={16} className={`text-slate-400 dark:text-slate-500 ${token.is_default ? 'opacity-100' : 'opacity-50'}`} />
                  {token.is_default && (
                    <span className="text-[10px] font-black uppercase tracking-widest bg-sky-500/10 text-sky-600 dark:text-sky-400 px-2 py-1 rounded-lg border border-sky-200 dark:border-sky-800">
                      Default
                    </span>
                  )}
                </div>

                {/* Bot Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot size={14} className="text-sky-500" />
                    <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Bot #{token.id}</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 text-lg font-semibold leading-relaxed group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    {token.name}
                  </p>
                  <code className="text-xs text-slate-500 dark:text-slate-500 font-mono bg-slate-100/80 dark:bg-slate-800/50 px-2 py-1 rounded-lg mt-1 block max-w-xs truncate">
                    {token.token_preview}
                  </code>
                </div>

                {/* Health Badge */}
                <div className="shrink-0">
                  {token.status ? (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border ${HEALTH_STATUS_COLORS[token.status]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${getHealthColor(token.status)}`}></span>
                      {HEALTH_STATUS_LABELS[token.status] || token.status}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-slate-100/80 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700">
                      Belum di-check
                    </span>
                  )}
                </div>

                {/* Active Toggle & Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleActivate(token.token_preview)}
                    className={`p-2.5 rounded-xl transition-all ${
                      token.is_active
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                        : 'bg-slate-100/80 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                    title={token.is_active ? 'Bot sedang aktif' : 'Aktifkan bot'}
                  >
                    <Power size={16} />
                  </button>
                  <button
                    onClick={() => openModal(token)}
                    className="p-2.5 bg-slate-50/80 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/30 rounded-xl transition-all"
                    title="Edit bot"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(token.id)}
                    className="p-2.5 bg-slate-50/80 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all"
                    title="Hapus bot"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center justify-center py-20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-2 border-dashed border-slate-200/50 dark:border-slate-700/50 rounded-3xl text-slate-400 dark:text-slate-500"
          >
            <div className="bg-slate-50/80 dark:bg-slate-800/50 p-6 rounded-full mb-6 text-slate-300 dark:text-slate-600">
              <Bot size={48} />
            </div>
            <p className="font-medium text-lg text-slate-500 dark:text-slate-400">Belum ada bot terdaftar</p>
            <p className="text-sm mt-2">Klik tombol di atas untuk menambahkan bot Telegram pertama Anda.</p>
          </motion.div>
        )}
      </div>

      {/* MODAL FORM */}
      {isModalOpen && (
        <motion.div
          className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <motion.div
            className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[2rem] w-full max-w-lg p-8 shadow-2xl overflow-hidden relative border border-slate-200/50 dark:border-slate-700/50"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Modal Glow Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>

            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                  {editingId ? 'Edit Bot' : 'Bot Baru'}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {editingId ? 'Perbarui konfigurasi bot ini' : 'Tambahkan token bot Telegram baru'}
                </p>
              </div>
              <button onClick={closeModal} className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!editingId && (
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <Bot size={16} className="text-sky-500" /> Token Bot (Telegram)
                  </label>
                  <textarea
                    required
                    className="w-full p-5 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all resize-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
                    rows={3}
                    value={formData.token}
                    onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                    placeholder="Contoh: 123456789:AAHkGaLxl0EUyUIk_d11lw-MCo88uD4kGOk"
                  />
                  <p className="text-xs text-slate-400 dark:text-slate-500">Token dapat Anda dapatkan dari @BotFather di Telegram.</p>
                </div>
              )}

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <Shield size={16} className="text-sky-500" /> Nama Bot
                </label>
                <input
                  type="text"
                  required
                  className="w-full p-4 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl focus:ring-4 focus:ring-sky-500/10 outline-none font-medium text-slate-700 dark:text-slate-200 transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Misal: Bruxism Bot"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-slate-100/80 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 py-4 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-[2] bg-gradient-to-r from-sky-500 to-cyan-500 text-white py-4 rounded-2xl font-bold hover:from-sky-600 hover:to-cyan-600 transition-all shadow-xl shadow-sky-500/30 active:scale-95"
                >
                  {editingId ? 'Perbarui Bot' : 'Simpan Bot'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

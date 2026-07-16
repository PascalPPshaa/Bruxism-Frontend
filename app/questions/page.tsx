"use client";
import { useEffect, useState, useCallback } from 'react';
import { getQuestions, createQuestion, updateQuestion, deleteQuestion } from '@/lib/api';
import { Question } from '@/types/database';
import { Plus, Edit2, Trash2, X, Clock, MessageSquare } from 'lucide-react';
import { Switch } from '@/components/animate-ui/components/radix/switch';
import { Label } from '@/components/ui/label';
import { motion } from 'motion/react';

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    question_text: '',
    scheduled_time: '08:00:00',
    isActive: true
  });

  const loadQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getQuestions();
      const list = res.data?.data || res.data;
      setQuestions(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Gagal memuat:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateQuestion(editingId, formData);
      } else {
        await createQuestion(formData);
      }
      closeModal();
      loadQuestions();
    } catch (err) {
      alert("Gagal menyimpan data.");
    }
  };

  const openModal = (q?: Question) => {
    if (q) {
      setEditingId(q.id);
        setFormData({ 
          question_text: q.question_text, 
          scheduled_time: q.scheduled_time, 
          isActive: q.is_active ?? true 
        });
    } else {
      setEditingId(null);
      setFormData({ question_text: '', scheduled_time: '08:00:00', isActive: true });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Hapus pertanyaan ini secara permanen?")) {
      try {
        await deleteQuestion(id);
        loadQuestions();
      } catch (err) {
        alert("Gagal menghapus data.");
      }
    }
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
              <MessageSquare size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Manajemen Pertanyaan</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Atur jadwal pertanyaan otomatis untuk pemantauan gejala pasien.</p>
            </div>
          </div>
          <button 
            onClick={() => openModal()}
            className="group bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-sky-500/30 active:scale-95"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform" /> 
            <span className="font-bold">Tambah Baru</span>
          </button>
        </motion.div>

        {/* Questions List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-20 italic text-slate-400 dark:text-slate-500">Memuat data...</div>
          ) : questions.length > 0 ? (
            questions.map((q, index) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
                className="group relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-6 transition-all hover:shadow-xl hover:shadow-sky-500/10 hover:border-sky-200 dark:hover:border-sky-700"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  
                  {/* Left: Time & Status Badge */}
                  <div className="flex flex-row md:flex-col items-center md:items-start gap-3 md:w-32 shrink-0">
                    <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 bg-sky-50/80 dark:bg-sky-950/50 px-3 py-1.5 rounded-xl font-mono font-bold text-sm">
                      <Clock size={16} />
                      {q.scheduled_time.substring(0, 5)}
                    </div>
                    {q.is_active ? (
                      <span className="text-[10px] px-2 py-1 bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-lg font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-900">Aktif</span>
                    ) : (
                      <span className="text-[10px] px-2 py-1 bg-slate-100/80 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-lg font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700">Draft</span>
                    )}
                  </div>

                  {/* Center: Question Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare size={16} className="text-slate-300 dark:text-slate-600" />
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Pertanyaan #{q.id}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-200 text-lg font-semibold leading-relaxed group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                      {q.question_text}
                    </p>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex md:flex-col gap-2 shrink-0 self-end md:self-start">
                    <button 
                      onClick={() => openModal(q)} 
                      className="p-3 bg-slate-50/80 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/30 rounded-xl transition-all"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(q.id)} 
                      className="p-3 bg-slate-50/80 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
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
              <div className="bg-slate-50/80 dark:bg-slate-800/50 p-4 rounded-full mb-4 text-slate-300 dark:text-slate-600">
                <Plus size={40} />
              </div>
              <p className="font-medium text-lg text-slate-500 dark:text-slate-400">Belum ada pertanyaan terdaftar</p>
              <p className="text-sm">Klik tombol di atas untuk membuat jadwal pertama Anda.</p>
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
                  {editingId ? 'Edit Pertanyaan' : 'Pertanyaan Baru'}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Konfigurasi pesan chatbot otomatis.</p>
              </div>
              <button onClick={closeModal} className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <MessageSquare size={16} className="text-sky-500" /> Isi Pertanyaan
                </label>
                <textarea 
                  required
                  className="w-full p-5 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all resize-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
                  rows={4}
                  value={formData.question_text}
                  onChange={(e) => setFormData({...formData, question_text: e.target.value})}
                  placeholder="Contoh: Apakah Anda merasakan nyeri rahang pagi ini?"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <Clock size={16} className="text-sky-500" /> Waktu Kirim
                  </label>
                  <input 
                    type="time"
                    step="1"
                    className="w-full p-4 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl focus:ring-4 focus:ring-sky-500/10 outline-none font-bold text-slate-700 dark:text-slate-200 transition-all"
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData({...formData, scheduled_time: e.target.value})}
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    Status Aktivasi
                  </label>
                  <div className="flex items-center gap-3 bg-slate-50/80 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                    <Switch 
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                      className="data-[state=checked]:bg-sky-500 data-[state=unchecked]:bg-slate-300 dark:data-[state=unchecked]:bg-slate-600"
                      thumbClassName="bg-white shadow-md data-[state=checked]:bg-white dark:data-[state=unchecked]:bg-slate-300"
                    />
                    <span className={`text-sm font-bold transition-colors duration-300 ${formData.isActive ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400 dark:text-slate-500'}`}>
                      {formData.isActive ? 'Aktif Sekarang' : 'Simpan Draft'}
                    </span>
                  </div>
                </div>
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
                  {editingId ? 'Perbarui Jadwal' : 'Aktifkan Jadwal'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
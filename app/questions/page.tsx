// "use client";
// import { useEffect, useState, useCallback } from 'react';
// import { getQuestions, createQuestion, updateQuestion, deleteQuestion } from '@/lib/api';
// import { Question } from '@/types/database';
// import { Plus, Edit2, Trash2, X, Clock, Hash } from 'lucide-react';

// export default function QuestionsPage() {
//   const [questions, setQuestions] = useState<Question[]>([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingId, setEditingId] = useState<number | null>(null);
  
//   const [formData, setFormData] = useState({
//     question_text: '',
//     scheduled_time: '08:00:00',
//     is_active: 1
//   });

//   const loadQuestions = useCallback(async () => {
//     try {
//       const res = await getQuestions();
//       if (res.data && Array.isArray(res.data.data)) {
//         setQuestions(res.data.data);
//       } else if (Array.isArray(res.data)) {
//         setQuestions(res.data);
//       }
//     } catch (err) {
//       console.error("Gagal memuat pertanyaan:", err);
//     }
//   }, []);

// //   useEffect(() => {
// //     loadQuestions();
// //   }, []);
// useEffect(() => {
//     const fetchQuestions = async () => {
//       await loadQuestions();
//     };
//     fetchQuestions();
//   }, [loadQuestions]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       if (editingId) {
//         await updateQuestion(editingId, formData);
//       } else {
//         await createQuestion(formData);
//       }
//       closeModal();
//       loadQuestions();
//     } catch (err) {
//       alert("Gagal menyimpan data. Pastikan backend aktif.");
//     }
//   };

//   const openModal = (q?: Question) => {
//     if (q) {
//       setEditingId(q.id);
//       setFormData({ 
//         question_text: q.question_text, 
//         scheduled_time: q.scheduled_time, 
//         is_active: q.is_active ?? 1 
//       });
//     } else {
//       setEditingId(null);
//       setFormData({ question_text: '', scheduled_time: '08:00:00', is_active: 1 });
//     }
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setEditingId(null);
//   };

//   const handleDelete = async (id: number) => {
//     if (confirm("Hapus pertanyaan ini? Tindakan ini tidak dapat dibatalkan.")) {
//       try {
//         await deleteQuestion(id);
//         loadQuestions();
//       } catch (err) {
//         alert("Gagal menghapus data.");
//       }
//     }
//   };

//   return (
//     <div className="p-8">
//       <div className="flex justify-between items-center mb-8">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-800">Manajemen Pertanyaan</h1>
//           <p className="text-sm text-slate-500">Atur jadwal dan teks pertanyaan chatbot otomatis.</p>
//         </div>
//         <button 
//           onClick={() => openModal()}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm"
//         >
//           <Plus size={20} /> Tambah Pertanyaan
//         </button>
//       </div>

//       <div className="grid gap-4">
//         {questions.length > 0 ? (
//           questions.map((q) => (
//             <div key={q.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center group transition-hover hover:border-blue-200">
//               <div className="space-y-3">
//                 <div className="flex items-center gap-3">
//                   <span className="flex items-center gap-1 text-[10px] font-bold uppercase bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
//                     <Hash size={12} /> {q.id}
//                   </span>
//                   <span className="flex items-center gap-1.5 text-sm text-slate-500 font-semibold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md">
//                     <Clock size={14} /> {q.scheduled_time}
//                   </span>
//                   {!q.is_active && (
//                     <span className="text-[10px] font-bold uppercase bg-red-50 text-red-500 px-2 py-1 rounded-md">Non-Aktif</span>
//                   )}
//                 </div>
//                 <p className="text-slate-800 font-medium text-lg leading-relaxed">{q.question_text}</p>
//               </div>
//               <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                 <button 
//                   onClick={() => openModal(q)} 
//                   className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
//                   title="Edit"
//                 >
//                   <Edit2 size={20} />
//                 </button>
//                 <button 
//                   onClick={() => handleDelete(q.id)} 
//                   className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
//                   title="Hapus"
//                 >
//                   <Trash2 size={20} />
//                 </button>
//               </div>
//             </div>
//           ))
//         ) : (
//           <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400">
//             Belum ada pertanyaan. Klik Tambah Pertanyaan untuk memulai.
//           </div>
//         )}
//       </div>

//       {/* MODAL FORM */}
//       {isModalOpen && (
//         <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
//             <div className="flex justify-between items-center mb-6">
//               <h2 className="text-xl font-bold text-slate-800">
//                 {editingId ? 'Edit Pertanyaan' : 'Pertanyaan Baru'}
//               </h2>
//               <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
//                 <X size={20} />
//               </button>
//             </div>

//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div className="space-y-2">
//                 <label className="text-sm font-semibold text-slate-700 ml-1">Teks Pertanyaan</label>
//                 <textarea 
//                   required
//                   className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all resize-none"
//                   rows={4}
//                   value={formData.question_text}
//                   onChange={(e) => setFormData({...formData, question_text: e.target.value})}
//                   placeholder="Masukkan pertanyaan yang akan dikirim bot..."
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <label className="text-sm font-semibold text-slate-700 ml-1">Waktu Kirim</label>
//                   <input 
//                     type="time"
//                     step="1"
//                     className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none"
//                     value={formData.scheduled_time}
//                     onChange={(e) => setFormData({...formData, scheduled_time: e.target.value})}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <label className="text-sm font-semibold text-slate-700 ml-1">Status</label>
//                   <select 
//                     className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none appearance-none bg-white cursor-pointer"
//                     value={formData.is_active}
//                     onChange={(e) => setFormData({...formData, is_active: Number(e.target.value)})}
//                   >
//                     <option value={1}>Aktif</option>
//                     <option value={0}>Non-Aktif</option>
//                   </select>
//                 </div>
//               </div>

//               <button 
//                 type="submit"
//                 className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-[0.98] mt-2"
//               >
//                 {editingId ? 'Simpan Perubahan' : 'Buat Pertanyaan'}
//               </button>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";
import { useEffect, useState, useCallback } from 'react';
import { getQuestions, createQuestion, updateQuestion, deleteQuestion } from '@/lib/api';
import { Question } from '@/types/database';
import { Plus, Edit2, Trash2, X, Clock, MessageSquare, ToggleLeft, ToggleRight} from 'lucide-react';

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    question_text: '',
    scheduled_time: '08:00:00',
    is_active: 1
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
        is_active: q.is_active ?? 1 
      });
    } else {
      setEditingId(null);
      setFormData({ question_text: '', scheduled_time: '08:00:00', is_active: 1 });
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
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            {/* <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold mb-3 uppercase tracking-wider">
              <CalendarClock size={14} /> Auto-Responder System
            </div> */}
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Manajemen Pertanyaan</h1>
            <p className="text-slate-500 mt-1">Atur jadwal pertanyaan otomatis untuk pemantauan gejala pasien.</p>
          </div>
          <button 
            onClick={() => openModal()}
            className="group bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform" /> 
            <span className="font-bold">Tambah Baru</span>
          </button>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-20 italic text-slate-400">Memuat data...</div>
          ) : questions.length > 0 ? (
            questions.map((q) => (
              <div key={q.id} className="group relative bg-white border border-slate-200 rounded-2xl p-6 transition-all hover:shadow-xl hover:shadow-slate-200/50 hover:border-blue-300">
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  
                  {/* Left: Time & Status Badge */}
                  <div className="flex flex-row md:flex-col items-center md:items-start gap-3 md:w-32 shrink-0">
                    <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl font-mono font-bold text-sm">
                      <Clock size={16} />
                      {q.scheduled_time.substring(0, 5)}
                    </div>
                    {q.is_active ? (
                      <span className="text-[10px] px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg font-black uppercase tracking-widest border border-emerald-100">Aktif</span>
                    ) : (
                      <span className="text-[10px] px-2 py-1 bg-slate-100 text-slate-400 rounded-lg font-black uppercase tracking-widest border border-slate-200">Draft</span>
                    )}
                  </div>

                  {/* Center: Question Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare size={16} className="text-slate-300" />
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Pertanyaan #{q.id}</span>
                    </div>
                    <p className="text-slate-700 text-lg font-semibold leading-relaxed group-hover:text-slate-900 transition-colors">
                      {q.question_text}
                    </p>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex md:flex-col gap-2 shrink-0 self-end md:self-start">
                    <button 
                      onClick={() => openModal(q)} 
                      className="p-3 bg-slate-50 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(q.id)} 
                      className="p-3 bg-slate-50 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-3xl text-slate-400">
              <div className="bg-slate-50 p-4 rounded-full mb-4 text-slate-300">
                <Plus size={40} />
              </div>
              <p className="font-medium text-lg text-slate-500">Belum ada pertanyaan terdaftar</p>
              <p className="text-sm">Klik tombol di atas untuk membuat jadwal pertama Anda.</p>
            </div>
          )}
        </div>
      </div>

      {/* REFINED MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-lg p-8 shadow-2xl overflow-hidden relative">
            
            {/* Modal Glow Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>

            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  {editingId ? 'Edit Pertanyaan' : 'Pertanyaan Baru'}
                </h2>
                <p className="text-sm text-slate-500">Konfigurasi pesan chatbot otomatis.</p>
              </div>
              <button onClick={closeModal} className="p-3 text-slate-400 hover:text-slate-600 rounded-2xl bg-slate-50 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <MessageSquare size={16} className="text-blue-500" /> Isi Pertanyaan
                </label>
                <textarea 
                  required
                  className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none text-slate-800 placeholder:text-slate-400 font-medium"
                  rows={4}
                  value={formData.question_text}
                  onChange={(e) => setFormData({...formData, question_text: e.target.value})}
                  placeholder="Contoh: Apakah Anda merasakan nyeri rahang pagi ini?"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Clock size={16} className="text-blue-500" /> Waktu Kirim
                  </label>
                  <input 
                    type="time"
                    step="1"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-700 transition-all"
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData({...formData, scheduled_time: e.target.value})}
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    Status Aktivasi
                  </label>
                  <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, is_active: formData.is_active === 1 ? 0 : 1})}
                      className="transition-colors outline-none"
                    >
                      {formData.is_active === 1 ? (
                        <ToggleRight className="text-blue-600 w-10 h-10" />
                      ) : (
                        <ToggleLeft className="text-slate-300 w-10 h-10" />
                      )}
                    </button>
                    <span className={`text-sm font-bold ${formData.is_active === 1 ? 'text-blue-600' : 'text-slate-400'}`}>
                      {formData.is_active === 1 ? 'Aktif Sekarang' : 'Simpan Draft'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                 <button 
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95"
                >
                  {editingId ? 'Perbarui Jadwal' : 'Aktifkan Jadwal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
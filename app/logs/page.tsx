// "use client";
// import { useEffect, useState } from 'react';
// import { getRecentLogs } from '@/lib/api';
// import { Patient, SymptomLog } from '@/types/database';
// import { Search, Calendar, Phone, MessageCircle } from 'lucide-react';

// export default function LogsPage() {
//   const [logs, setLogs] = useState<SymptomLog[]>([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [patient, setPatient] = useState<Patient | null>(null);

//   useEffect(() => {
//     const fetchLogs = async () => {
//       try {
//         const res = await getRecentLogs();
//         const logData = res.data?.data || res.data;
//         if (Array.isArray(logData)) {
//           setLogs(logData);
//         }
//       } catch (err) {
//         console.error("Gagal mengambil log:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchLogs();
//   }, []);

//   const filteredLogs = logs.filter(log => 
//     log.phone_number?.includes(searchTerm) || 
//     log.answer.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div className="p-8">
//       <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-800">Riwayat Interaksi</h1>
//           <p className="text-slate-500 text-sm">Pantau semua jawaban pasien dari chatbot bruxism.</p>
//         </div>

//         {/* Search Bar */}
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//           <input 
//             type="text"
//             placeholder="Cari nomor HP atau jawaban..."
//             className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-80 transition-all"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>
//       </div>

//       <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full text-left text-sm">
//             <thead className="bg-slate-50 border-b border-slate-100">
//               <tr>
//                 <th className="px-6 py-4 font-bold text-slate-700">Waktu</th>
//                 <th className="px-6 py-4 font-bold text-slate-700">Nama Pasien</th>
//                 <th className="px-6 py-4 font-bold text-slate-700">Nomor Pasien</th>
//                 <th className="px-6 py-4 font-bold text-slate-700">Pertanyaan</th>
//                 <th className="px-6 py-4 font-bold text-slate-700">Jawaban Pasien</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-50">
//               {loading ? (
//                 <tr>
//                   <td colSpan={4} className="px-6 py-10 text-center text-slate-400">Memuat riwayat...</td>
//                 </tr>
//               ) : filteredLogs.length > 0 ? (
//                 filteredLogs.map((log) => (
//                   <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
//                     <td className="px-6 py-4 whitespace-nowrap text-slate-500">
//                       <div className="flex items-center gap-2">
//                         <Calendar size={14} />
//                         {new Date(log.createdAt).toLocaleDateString('id-ID')}
//                         <span className="text-xs text-slate-400">
//                           {new Date(log.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
//                         </span>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                         <div className="space-y-1">
//                             <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">
//                                 {log.phone_number_patient?.name || "Pasien Anonim"} 
//                             </p>
//                         </div>
//                     </td>
//                     {/* <div className="font-bold text-slate-900">
//                         {log.phone_number_patient?.name || "Pasien Anonim"} 
//                     </div> */}
//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-2 font-mono font-semibold text-slate-700">
//                         <Phone size={14} className="text-slate-400" />
//                         {log.phone_number}
//                       </div>
//                     </td>
//                     {/* <td className="px-6 py-4 text-center">
//                       <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-bold">
//                         #{log.question_id}
//                       </span>
//                     </td> */}
//                     <td className="px-6 py-4">
//                         <div className="flex items-start gap-2 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
//                         <MessageCircle size={20} className="text-blue-500 mt-0.5" />
//                             <span className="text-slate-700 leading-relaxed font-medium italic">
//                                 {log.question?.question_text || `ID #${log.question_id}`}
//                             </span>
//                         </div>
//                         {/* <div className="space-y-1">
//                             <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">
//                                 {log.question?.question_text || `ID #${log.question_id}`}
//                             </p>
//                         </div> */}
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="flex items-start gap-2 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
//                         <MessageCircle size={20} className="text-blue-500 mt-0.5" />
//                         <span className="text-slate-700 leading-relaxed font-medium italic">
//                           {log.answer}
//                         </span>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan={4} className="px-6 py-10 text-center text-slate-400">
//                     Tidak ada log interaksi yang ditemukan.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

// "use client";
// import { useEffect, useState } from 'react';
// import { getRecentLogs } from '@/lib/api';
// import { SymptomLog } from '@/types/database';
// import { Search, Calendar, Phone, MessageCircle, User, Bot, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

// export default function LogsPage() {
//   const [logs, setLogs] = useState<SymptomLog[]>([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [loading, setLoading] = useState(true);
  
//   // --- State untuk Pagination ---
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10; // Tampilkan 10 data per halaman

//   useEffect(() => {
//     const fetchLogs = async () => {
//       try {
//         const res = await getRecentLogs();
//         const logData = res.data?.data || res.data;
//         if (Array.isArray(logData)) setLogs(logData);
//       } catch (err) {
//         console.error("Gagal mengambil log:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchLogs();
//   }, []);

//   // Filter data berdasarkan search
//   const filteredLogs = logs.filter(log => 
//     log.phone_number?.includes(searchTerm) || 
//     log.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     log.phone_number_patient?.name?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   // --- Logika Pagination ---
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentLogs = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

//   const goToPage = (pageNumber: number) => {
//     setCurrentPage(pageNumber);
//     window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll ke atas saat ganti halaman
//   };

//   return (
//     <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
//       <div className="max-w-7xl mx-auto">
        
//         {/* Header & Search */}
//         <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
//           <div>
//             <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
//               <MessageCircle className="text-blue-600" /> Riwayat Interaksi
//             </h1>
//             <p className="text-slate-500 text-sm mt-1">Log aktivitas percakapan antara Chatbot dan Pasien.</p>
//           </div>

//           <div className="relative group">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
//             <input 
//               type="text"
//               placeholder="Cari pasien atau isi jawaban..."
//               className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none w-full md:w-80 transition-all shadow-sm"
//               value={searchTerm}
//               onChange={(e) => {
//                 setSearchTerm(e.target.value);
//                 setCurrentPage(1); // Reset ke halaman 1 saat mencari
//               }}
//             />
//           </div>
//         </div>

//         {/* Table Container */}
//         <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full text-left text-sm border-collapse">
//               <thead>
//                 <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[11px] tracking-widest">
//                   <th className="px-6 py-5">Info Sesi</th>
//                   <th className="px-6 py-5">Pasien</th>
//                   <th className="px-6 py-5 w-[40%]">Percakapan (Bot & User)</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-50">
//                 {!loading && currentLogs.map((log) => (
//                   <tr key={log.id} className="hover:bg-blue-50/20 transition-colors group">
//                     <td className="px-6 py-6 align-top">
//                         <div className="flex flex-col gap-1">
//                           <div className="flex items-center gap-2 text-slate-700 font-bold">
//                             <Calendar size={14} className="text-blue-500" />
//                             {new Date(log.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
//                           </div>
//                           <div className="flex items-center gap-2 text-slate-400 text-xs font-medium italic">
//                             <Clock size={12} />
//                             {new Date(log.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
//                           </div>
//                         </div>
//                     </td>
//                     <td className="px-6 py-6 align-top">
//                         <div className="flex flex-col gap-1.5">
//                           <span className="font-bold text-slate-800 tracking-tight">
//                             {log.phone_number_patient?.name || "Pasien Anonim"}
//                           </span>
//                           <span className="flex items-center gap-2 text-slate-400 font-mono text-xs">
//                             <Phone size={12} /> {log.phone_number}
//                           </span>
//                         </div>
//                     </td>
//                     <td className="px-6 py-6">
//                         <div className="space-y-3">
//                           {/* Question */}
//                           <div className="flex gap-2 items-start">
//                             <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 shrink-0 mt-0.5"><Bot size={12} /></div>
//                             <div className="bg-blue-50 text-blue-800 p-3 rounded-2xl rounded-tl-none border border-blue-100 text-[13px] italic">
//                               {log.question?.question_text || `ID #${log.question_id}`}
//                             </div>
//                           </div>
//                           {/* Answer */}
//                           <div className="flex gap-2 items-start justify-end">
//                             <div className="bg-emerald-50 text-emerald-800 p-3 rounded-2xl rounded-tr-none border border-emerald-100 text-[13px] font-bold">
//                               {log.answer}
//                             </div>
//                             <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 shrink-0 mt-0.5"><User size={12} /></div>
//                           </div>
//                         </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Navigasi Pagination */}
//           <div className="px-6 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
//             <p className="text-xs text-slate-500 font-medium italic">
//               Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredLogs.length)} dari {filteredLogs.length} data
//             </p>
            
//             <div className="flex items-center gap-2">
//               <button 
//                 onClick={() => goToPage(currentPage - 1)}
//                 disabled={currentPage === 1}
//                 className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-all text-slate-600"
//               >
//                 <ChevronLeft size={18} />
//               </button>
              
//               {/* Page Numbers */}
//               <div className="flex gap-1">
//                 {[...Array(totalPages)].map((_, i) => {
//                   const pageNum = i + 1;
//                   // Tampilkan hanya halaman di sekitar halaman aktif jika total halaman sangat banyak
//                   if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
//                     return (
//                       <button
//                         key={pageNum}
//                         onClick={() => goToPage(pageNum)}
//                         className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
//                           currentPage === pageNum 
//                             ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
//                             : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-400'
//                         }`}
//                       >
//                         {pageNum}
//                       </button>
//                     );
//                   }
//                   if (pageNum === currentPage - 2 || pageNum === currentPage + 2) return <span key={pageNum} className="text-slate-300 px-1">...</span>;
//                   return null;
//                 })}
//               </div>

//               <button 
//                 onClick={() => goToPage(currentPage + 1)}
//                 disabled={currentPage === totalPages}
//                 className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-all text-slate-600"
//               >
//                 <ChevronRight size={18} />
//               </button>
//             </div>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }

"use client";
import { useEffect, useState, useMemo } from 'react';
import { getRecentLogs } from '@/lib/api';
import { SymptomLog } from '@/types/database';
import { Search, Calendar, Phone, MessageCircle, User, Bot, Clock, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

export default function LogsPage() {
  const [logs, setLogs] = useState<SymptomLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("all"); // State untuk filter 1 pasien
  const [loading, setLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await getRecentLogs();
        const logData = res.data?.data || res.data;
        if (Array.isArray(logData)) setLogs(logData);
      } catch (err) {
        console.error("Gagal mengambil log:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  // 1. Ambil daftar pasien unik untuk dropdown filter
  const patientList = useMemo(() => {
    const patients = logs.map(log => ({
      id: log.phone_number,
      name: log.phone_number_patient?.name || "Pasien Anonim",
      phone: log.phone_number
    }));
    
    // Hilangkan duplikat berdasarkan nomor telepon
    return Array.from(new Map(patients.map(p => [p.id, p])).values());
  }, [logs]);

  // 2. Filter data berdasarkan Nama Pasien (Dropdown) DAN Search Term
  const filteredLogs = logs.filter(log => {
    const matchesPatient = selectedPatient === "all" || log.phone_number === selectedPatient;
    const matchesSearch = 
      log.phone_number?.includes(searchTerm) || 
      log.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.phone_number_patient?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesPatient && matchesSearch;
  });

  // --- Logika Pagination ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <MessageCircle className="text-blue-600" /> Riwayat Interaksi
            </h1>
            <p className="text-slate-500 text-sm mt-1">
               {selectedPatient !== "all" ? `Menampilkan riwayat khusus satu pasien` : `Log aktivitas semua pasien.`}
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Filter Dropdown Pasien */}
            <div className="relative w-full md:w-64">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select 
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none w-full appearance-none text-sm font-semibold text-slate-700 shadow-sm cursor-pointer"
                value={selectedPatient || "all"}
                onChange={(e) => {
                  setSelectedPatient(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">Semua Pasien</option>
                {patientList.map(p => (
                  <option key={p.id ?? ''} value={p.id ?? ''}>
                    {p.name} ({p.phone})
                  </option>
                ))}
              </select>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Cari kata kunci jawaban..."
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none w-full transition-all shadow-sm text-sm"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            {/* ... isi tabel sama seperti kode sebelumnya ... */}
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[11px] tracking-widest">
                  <th className="px-6 py-5">Info Sesi</th>
                  <th className="px-6 py-5">Pasien</th>
                  <th className="px-6 py-5 w-[40%]">Percakapan (Bot & User)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={3} className="px-6 py-20 text-center text-slate-400">Memuat data...</td></tr>
                ) : currentLogs.length > 0 ? (
                  currentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-blue-50/20 transition-colors group">
                      <td className="px-6 py-6 align-top">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-slate-700 font-bold">
                            <Calendar size={14} className="text-blue-500" />
                            {new Date(log.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          </div>
                          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium italic">
                            <Clock size={12} /> {new Date(log.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 align-top">
                        <div className="flex flex-col gap-1.5">
                          <span className="font-bold text-slate-800 tracking-tight">
                            {log.phone_number_patient?.name || "Pasien Anonim"}
                          </span>
                          <span className="flex items-center gap-2 text-slate-400 font-mono text-xs">
                            <Phone size={12} /> {log.phone_number}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="space-y-3">
                          <div className="flex gap-2 items-start">
                            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 shrink-0 mt-0.5"><Bot size={12} /></div>
                            <div className="bg-blue-50 text-blue-800 p-3 rounded-2xl rounded-tl-none border border-blue-100 text-[13px] italic">
                              {log.question?.question_text || `ID #${log.question_id}`}
                            </div>
                          </div>
                          <div className="flex gap-2 items-start justify-end">
                            <div className="bg-emerald-50 text-emerald-800 p-3 rounded-2xl rounded-tr-none border border-emerald-100 text-[13px] font-bold">
                              {log.answer}
                            </div>
                            <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 shrink-0 mt-0.5"><User size={12} /></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={3} className="px-6 py-20 text-center text-slate-400">Tidak ada log ditemukan.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Navigasi Pagination */}
          <div className="px-6 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500 font-medium italic">
              Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredLogs.length)} dari {filteredLogs.length} data
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-50 text-slate-600"
              >
                <ChevronLeft size={18} />
              </button>
              
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToPage(i + 1)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                      currentPage === i + 1 ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-600'
                    }`}
                  >
                    {i + 1}
                  </button>
                )).slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 1))}
              </div>

              <button 
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-50 text-slate-600"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
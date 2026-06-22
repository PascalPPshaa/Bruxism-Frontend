// "use client";

// export const dynamic = "force-dynamic";


// import { useEffect, useState } from "react";
// import { getPatients, deletePatient } from "@/lib/api";
// import { Patient } from "@/types/database";
// import {
//   Trash2,
//   Loader2,
//   Search,
//   Users,
//   Phone,
//   Calendar,
//   ShieldCheck,
//   AlertCircle,
// } from "lucide-react";


// export default function PatientsPage() {
//   const [data, setData] = useState<Patient[]>([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isDeleting, setIsDeleting] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let mounted = true;

//     const loadPatients = async () => {
//       try {
//         setLoading(true);
//         const res = await getPatients();
//         const patientList = res.data?.data || res.data;
//         if (mounted && Array.isArray(patientList)) {
//           setData(patientList);
//         }
//       } catch (err) {
//         console.error("Gagal memuat pasien:", err);
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     };

//     loadPatients();
//     return () => {
//       mounted = false;
//     };
//   }, []);

//   const filteredData = data.filter(
//     (p) =>
//       p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       p.phone.includes(searchTerm)
//   );

//   const handleDelete = async (phone: string) => {
//     if (typeof window === "undefined") return;

//     const confirmDelete = window.confirm(
//       `Hapus Pasien?\n\nData pasien (${phone}) dan seluruh riwayat log akan dihapus permanen.`
//     );

//     if (!confirmDelete) return;

//     try {
//       setIsDeleting(phone);
//       await deletePatient(phone);
//       window.alert("Data pasien berhasil dihapus.");

//       const res = await getPatients();
//       const patientList = res.data?.data || res.data;
//       if (Array.isArray(patientList)) {
//         setData(patientList);
//       }
//     } catch (err: unknown) {
//       const errorMsg =
//         (err as { response?: { data?: { message?: string } } })?.response?.data
//           ?.message || "Terjadi kesalahan koneksi.";
//       window.alert(`Gagal menghapus: ${errorMsg}`);
//     } finally {
//       setIsDeleting(null);
//     }
//   };

//   return (
//     <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
//       <div className="max-w-7xl mx-auto space-y-6">
//         {/* HEADER */}
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//           <div>
//             <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
//               Database Pasien
//             </h1>
//             <p className="text-slate-500 text-sm">
//               Kelola informasi pasien dan status pendaftaran.
//             </p>
//           </div>

//           <div className="relative w-full md:w-64">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
//             <input
//               type="text"
//               placeholder="Cari nama / nomor..."
//               className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none w-full"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </div>
//         </div>

//         {/* STATS */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
//             <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
//               <Users size={20} />
//             </div>
//             <div>
//               <p className="text-xs text-slate-500 font-medium uppercase">
//                 Total Pasien
//               </p>
//               <p className="text-xl font-bold text-slate-900">
//                 {data.length}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* TABLE */}
//         <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm text-left">
//               <thead>
//                 <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500">
//                   <th className="px-6 py-4 font-semibold">
//                     Identitas Pasien
//                   </th>
//                   <th className="px-6 py-4 font-semibold">
//                     Kontak & Lahir
//                   </th>
//                   <th className="px-6 py-4 font-semibold">
//                     Status
//                   </th>
//                   <th className="px-6 py-4 text-center font-semibold">
//                     Aksi
//                   </th>
//                 </tr>
//               </thead>

//               <tbody className="divide-y divide-slate-50">
//                 {loading ? (
//                   <tr>
//                     <td colSpan={4} className="py-20 text-center">
//                       <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
//                       <p className="text-slate-400 mt-2">
//                         Memuat data pasien...
//                       </p>
//                     </td>
//                   </tr>
//                 ) : filteredData.length > 0 ? (
//                   filteredData.map((p) => (
//                     <tr
//                       key={p.phone}
//                       className="hover:bg-blue-50/30 transition-colors"
//                     >
//                       <td className="px-6 py-4">
//                         <p className="font-bold text-slate-800">
//                           {p.name || "Anonymous"}
//                         </p>
//                         <p className="text-xs text-slate-400 font-mono">
//                           ID: {p.phone}
//                         </p>
//                       </td>

//                       <td className="px-6 py-4 space-y-1">
//                         <div className="flex items-center gap-2 text-slate-600">
//                           <Phone size={14} />
//                           {p.phone}
//                         </div>
//                         <div className="flex items-center gap-2 text-slate-400 text-xs">
//                           <Calendar size={14} />
//                           {p.birth || "Tanggal lahir kosong"}
//                         </div>
//                       </td>

//                       <td className="px-6 py-4">
//                         {p.isRegistered ? (
//                           <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-bold">
//                             <ShieldCheck size={14} /> Verified
//                           </span>
//                         ) : (
//                           <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 text-xs font-bold">
//                             <AlertCircle size={14} /> Pending
//                           </span>
//                         )}
//                       </td>

//                       <td className="px-6 py-4 text-center">
//                         <button
//                           disabled={isDeleting === p.phone}
//                           onClick={() => handleDelete(p.phone)}
//                           className={`p-2.5 rounded-xl transition-all ${
//                             isDeleting === p.phone
//                               ? "bg-slate-100 text-slate-300"
//                               : "text-slate-400 hover:text-red-600 hover:bg-red-50"
//                           }`}
//                         >
//                           {isDeleting === p.phone ? (
//                             <Loader2 size={18} className="animate-spin" />
//                           ) : (
//                             <Trash2 size={18} />
//                           )}
//                         </button>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan={4} className="py-20 text-center text-slate-400">
//                       Data pasien tidak ditemukan.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { getPatients, deletePatient } from "@/lib/api";
import { Patient } from "@/types/database";
import {
  Trash2,
  Loader2,
  Search,
  Users,
  Phone,
  Calendar,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

export default function PatientsPage() {
  const [data, setData] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadPatients = async () => {
      try {
        setLoading(true);
        const res = await getPatients();
        const patientList = res.data?.data || res.data;
        if (mounted && Array.isArray(patientList)) {
          setData(patientList);
        }
      } catch (err) {
        console.error("Gagal memuat pasien:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadPatients();
    return () => {
      mounted = false;
    };
  }, []);

  // Filter adaptif mendukung format string LID murni tanpa trimming sesuai dokumentasi
  const filteredData = data.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (phone: string) => {
    if (typeof window === "undefined") return;

    const confirmDelete = window.confirm(
      `Hapus Pasien?\n\nData pasien (${phone}) dan seluruh riwayat log akan dihapus permanen.`
    );

    if (!confirmDelete) return;

    try {
      setIsDeleting(phone);
      await deletePatient(phone);
      window.alert("Data pasien berhasil dihapus.");

      const res = await getPatients();
      const patientList = res.data?.data || res.data;
      if (Array.isArray(patientList)) {
        setData(patientList);
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Terjadi kesalahan koneksi.";
      window.alert(`Gagal menghapus: ${errorMsg}`);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Database Pasien
            </h1>
            <p className="text-slate-500 text-sm">
              Kelola informasi pasien dan status pendaftaran (Mendukung Linked ID WhatsApp).
            </p>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari nama / nomor ID..."
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Users size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase">
                Total Pasien
              </p>
              <p className="text-xl font-bold text-slate-900">
                {data.length}
              </p>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500">
                  <th className="px-6 py-4 font-semibold">Identitas Pasien</th>
                  <th className="px-6 py-4 font-semibold">Kontak & Lahir</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 text-center font-semibold">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-20 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
                      <p className="text-slate-400 mt-2">Memuat data pasien...</p>
                    </td>
                  </tr>
                ) : filteredData.length > 0 ? (
                  filteredData.map((p) => (
                    <tr key={p.phone} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">
                          {p.name || "Anonymous"}
                        </p>
                        <p className="text-xs text-slate-400 font-mono break-all">
                          ID: {p.phone} {/* Menampilkan ID apa adanya termasuk _lid */}
                        </p>
                      </td>

                      <td className="px-6 py-4 space-y-1">
                        <div className="flex items-center gap-2 text-slate-600 font-mono text-xs break-all">
                          <Phone size={14} className="shrink-0" />
                          {p.phone}
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 text-xs">
                          <Calendar size={14} className="shrink-0" />
                          {p.birth || "Tanggal lahir kosong"}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {p.isRegistered ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-bold">
                            <ShieldCheck size={14} /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 text-xs font-bold">
                            <AlertCircle size={14} /> Pending
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <button
                          disabled={isDeleting === p.phone}
                          onClick={() => handleDelete(p.phone)}
                          className={`p-2.5 rounded-xl transition-all ${
                            isDeleting === p.phone
                              ? "bg-slate-100 text-slate-300"
                              : "text-slate-400 hover:text-red-600 hover:bg-red-50"
                          }`}
                        >
                          {isDeleting === p.phone ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-20 text-center text-slate-400">
                      Data pasien tidak ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
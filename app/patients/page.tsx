"use client";
import React, { useEffect, useState } from 'react';
import { getPatients, deletePatient } from '@/lib/api';
import { Patient } from '@/types/database';
import { Users, Search, Trash2, ChevronRight, UserCheck, UserX, Loader2, Calendar, Phone } from 'lucide-react';

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await getPatients();
      setPatients(res.data.data || []);
    } catch (err) {
      console.error("Gagal mengambil data pasien", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (telegram_id: string) => {
    if (!confirm("Yakin hapus pasien ini?")) return;
    setDeletingId(telegram_id);
    try {
      await deletePatient(telegram_id);
      setPatients(prev => prev.filter(p => p.telegram_id !== telegram_id));
    } catch (err) {
      console.error("Gagal hapus pasien", err);
      alert("Gagal menghapus pasien");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = patients.filter(p => {
    const q = search.toLowerCase();
    return (
      p.telegram_id.toLowerCase().includes(q) ||
      (p.name?.toLowerCase().includes(q) ?? false)
    );
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      <p className="text-slate-500 font-medium animate-pulse">Memuat data pasien...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10 px-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-600 rounded-lg text-white">
          <Users size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Manajemen Pasien</h1>
          <p className="text-slate-500 text-sm">Kelola data pasien Telegram yang terdaftar.</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Cari pasien (Telegram ID atau Nama)..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 shadow-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Telegram ID</th>
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Nama</th>
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Tanggal Lahir</th>
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Status</th>
                <th className="text-right px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                    {search ? "Pasien tidak ditemukan." : "Belum ada data pasien."}
                  </td>
                </tr>
              ) : filtered.map((patient) => (
                <tr key={patient.telegram_id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded">
                      {patient.telegram_id}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">
                        {patient.name ? patient.name[0].toUpperCase() : "?"}
                      </div>
                      <span className="font-medium text-slate-700">
                        {patient.name || <span className="text-slate-400 italic">Belum ada nama</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar size={14} className="text-slate-400" />
                      {patient.birth || <span className="text-slate-400 italic">-</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {patient.isRegistered ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                        <UserCheck size={14} /> Terdaftar
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                        <UserX size={14} /> Belum Terdaftar
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(patient.telegram_id)}
                      disabled={deletingId === patient.telegram_id}
                      className="inline-flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-xl transition-all disabled:opacity-50"
                    >
                      {deletingId === patient.telegram_id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400">
        Total {filtered.length} dari {patients.length} pasien
      </p>
    </div>
  );
}
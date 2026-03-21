"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { getStatsCount, getRecentLogs } from '../lib/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  Users, Bot, ZapOff, AlertCircle, CheckCircle2, ArrowRight, LayoutDashboard, Activity 
} from 'lucide-react';
import { SymptomLog } from '../types/database';

export default function DashboardPage() {
  const [stats, setStats] = useState({ totalPatients: 0 });
  const [recentData, setRecentData] = useState<SymptomLog[]>([]);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState<string>('Menginisialisasi...');
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [countRes, recentRes] = await Promise.all([
          getStatsCount(),
          getRecentLogs()
        ]);
        setStats({ totalPatients: countRes.data.total_patients || 0 });
        setRecentData(recentRes.data.data || []);
      } catch (err) {
        console.error("Gagal mengambil data dashboard", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();

    const rawUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!rawUrl) {
      console.error('NEXT_PUBLIC_API_URL is not defined');
      return;
    }
    const socketUrl = new URL(rawUrl).origin; 
    
    const socket: Socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      setStatus('Terhubung ke Server...');
    });

    socket.on('WA_READY', (state: boolean) => {
      setStatus('WhatsApp Bot Siap! ✅');
      setIsReady(true);
    });

    socket.on('WA_AUTH', (msg: string) => {
      setStatus(msg);
      setIsReady(false);
    });

    socket.on('disconnect', () => {
      setStatus('Koneksi Terputus.');
      setIsReady(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const analysis = useMemo(() => {
    let nyeri = 0;
    let tidakNyeri = 0;
    recentData.forEach(log => {
      const ans = (log.answer || "").toLowerCase();
      if (ans.includes('nyeri') || ans.includes('sakit') || ans.includes('ya')) nyeri++;
      else if (ans.includes('tidak') || ans.includes('gak') || ans.includes('ga ')) tidakNyeri++;
    });
    return [
      { name: 'Nyeri/Ya', value: nyeri, color: '#ef4444' },
      { name: 'Normal/Tidak', value: tidakNyeri, color: '#10b981' }, 
    ];
  }, [recentData]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 font-medium animate-pulse">Menganalisis data...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10 px-4">
      
      {/* --- STATUS WA BOT (Sesuai Gambar 1 & Logic Socket) --- */}
      <div className={`flex items-center justify-between p-5 rounded-3xl border transition-all duration-500 shadow-sm ${
        isReady 
        ? "bg-emerald-50 border-emerald-100 text-emerald-900" 
        : "bg-orange-50 border-orange-100 text-orange-900"
      }`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl shadow-md ${isReady ? "bg-emerald-500 text-white" : "bg-orange-500 text-white"}`}>
            {isReady ? <Bot size={24} /> : <ZapOff size={24} />}
          </div>
          <div>
            <h4 className="font-bold text-base leading-tight">
              Status Koneksi WhatsApp
            </h4>
            <p className="text-sm font-semibold mt-1">
              {status}
            </p>
          </div>
        </div>
        {isReady && (
          <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500 text-white shadow-sm animate-pulse">
            <span className="text-[10px] font-black uppercase tracking-widest">Bot Online</span>
          </div>
        )}
      </div>

      <hr className="border-slate-100" />

      {/* --- HEADER DASHBOARD --- */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-600 rounded-lg text-white">
          <LayoutDashboard size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Bruxism Admin Dashboard</h1>
          <p className="text-slate-500 text-sm">Ringkasan aktivitas chatbot dan kondisi pasien.</p>
        </div>
      </div>

      {/* --- STAT CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Pasien" value={stats.totalPatients} icon={<Users size={24} />} color="bg-blue-50 text-blue-600" />
        <StatCard title="Pasien Nyeri" value={analysis[0].value} icon={<AlertCircle size={24} />} color="bg-red-50 text-red-600" />
        <StatCard title="Pasien Normal" value={analysis[1].value} icon={<CheckCircle2 size={24} />} color="bg-emerald-50 text-emerald-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart Distribusi Gejala */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-8">
            <Activity size={20} className="text-blue-500" /> Distribusi Gejala
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analysis}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={60}>
                  {analysis.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Interaksi Terbaru (Sidebar Style Sesuai Gambar 2) */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
          <h3 className="mb-6 text-lg font-bold text-slate-800 flex items-center gap-2">
            Interaksi Terbaru
          </h3>
          <div className="space-y-3">
            {recentData.slice(0, 6).map((log: SymptomLog) => (
              <div key={log.id} className="group flex items-center justify-between p-4 bg-slate-50/50 hover:bg-blue-50 rounded-2xl transition-all border border-transparent hover:border-blue-100">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0 text-slate-400">
                    <Users size={18} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-slate-700 truncate">{log.phone_number}</p>
                    <p className="text-xs text-slate-500 italic truncate max-w-[180px]">{log.answer}</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-500" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-komponen StatCard
function StatCard({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-5">
        <div className={`p-4 rounded-2xl ${color} shadow-inner`}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">{title}</p>
          <p className="text-3xl font-black text-slate-900">{value.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
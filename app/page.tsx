"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { getStatsCount, getRecentLogs } from '../lib/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  Users, Bot, ZapOff, AlertCircle, CheckCircle2, ArrowRight, LayoutDashboard, BarChart3
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

    // Telegram bot status - simplified
    socket.on('NEW_SYMPTOM_DATA', (data: SymptomLog) => {
      setRecentData(prev => [data, ...prev].slice(0, 50));
    });

    socket.on('disconnect', () => {
      setStatus('Koneksi Terputus.');
      setIsReady(false);
    });

    // Assume bot is ready if connected (Telegram bot doesn't have explicit ready state like WhatsApp)
    socket.on('connect', () => {
      setIsReady(true);
      setStatus('Telegram Bot Aktif ✅');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const scaleAnalysis = useMemo(() => {
    const counts: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    
    recentData.forEach(log => {
      const answer = log.answer;
      if (answer >= 1 && answer <= 5) {
        counts[String(answer)]++;
      }
    });

    return [
      { name: 'Skala 1', value: counts['1'], color: '#3b82f6' },
      { name: 'Skala 2', value: counts['2'], color: '#10b981' },
      { name: 'Skala 3', value: counts['3'], color: '#f59e0b' },
      { name: 'Skala 4', value: counts['4'], color: '#f97316' },
      { name: 'Skala 5', value: counts['5'], color: '#ef4444' },
    ];
  }, [recentData]);

  const summaryStats = useMemo(() => {
    const nyeriCount = scaleAnalysis[2].value + scaleAnalysis[3].value + scaleAnalysis[4].value;
    const normalCount = scaleAnalysis[0].value + scaleAnalysis[1].value;

    return {
      nyeri: nyeriCount,
      normal: normalCount
    };
  }, [scaleAnalysis]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 font-medium animate-pulse">Menganalisis data...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10 px-4">
      
      {/* --- STATUS BOT --- */}
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
              Status Telegram Bot
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
          <p className="text-slate-500 text-sm">Ringkasan aktivitas chatbot dan kondisi intensitas gejala pasien.</p>
        </div>
      </div>

      {/* --- STAT CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Pasien" value={stats.totalPatients} icon={<Users size={24} />} color="bg-blue-50 text-blue-600" />
        <StatCard title="Gejala Tinggi (Skala 3-5)" value={summaryStats.nyeri} icon={<AlertCircle size={24} />} color="bg-red-50 text-red-600" />
        <StatCard title="Gejala Rendah (Skala 1-2)" value={summaryStats.normal} icon={<CheckCircle2 size={24} />} color="bg-emerald-50 text-emerald-600" />
      </div>

      {/* --- DIAGRAM / GRAFIK UTAMA --- */}
      <div className="grid grid-cols-1 gap-8">
        
        {/* Grafik Distribusi Tingkat Keparahan (Skala 1-5) */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-8">
            <BarChart3 size={20} className="text-indigo-500" /> Intensitas Gejala Pasien (Skala 1-5)
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scaleAnalysis}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={55}>
                  {scaleAnalysis.map((entry, index) => (
                    <Cell key={`cell-scale-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- INTERAKSI TERBARU --- */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 max-w-full">
        <h3 className="mb-6 text-lg font-bold text-slate-800 flex items-center gap-2">
          Interaksi Terbaru
        </h3>
        {recentData.length === 0 ? (
          <p className="text-slate-400 text-sm italic text-center py-4">Belum ada data interaksi terbaru.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentData.slice(0, 6).map((log: SymptomLog) => (
              <div key={log.id} className="group flex items-center justify-between p-4 bg-slate-50/50 hover:bg-blue-50 rounded-2xl transition-all border border-transparent hover:border-blue-100">
                <div className="flex items-center gap-3 overflow-hidden w-full">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0 text-slate-400">
                    <Users size={18} />
                  </div>
                  <div className="overflow-hidden w-full">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-700 truncate">
                        {log.patient?.name || "Pasien Anonim"}
                      </p>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">{log.telegram_id}</span>
                    </div>
                    <p className="text-xs text-slate-500 italic truncate max-w-xs mt-0.5">Skala: {log.answer}</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-500 ml-2 shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

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
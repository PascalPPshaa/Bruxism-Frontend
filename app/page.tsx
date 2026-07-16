"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getStatsCount, getRecentLogs, getPatients } from '../lib/api';
import { Patient } from '../types/database';
import { 
  Bar, CartesianGrid, ComposedChart, Label, Line, ResponsiveContainer, Tooltip, XAxis, YAxis 
} from "recharts";
import { ChartTooltipContent, selectEvenlySpacedItems } from "@/components/application/charts/charts-base";
import { 
  Users, Bot, ZapOff, AlertCircle, CheckCircle2, ArrowRight, LayoutDashboard, BarChart3
} from 'lucide-react';
import { SymptomLog } from '../types/database';
import SplitText from '@/components/SplitText';
import { motion } from 'motion/react';

export default function DashboardPage() {
  const [stats, setStats] = useState({ totalPatients: 0 });
  const [recentData, setRecentData] = useState<SymptomLog[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState<string>('Menginisialisasi...');
  const [isReady, setIsReady] = useState<boolean>(false);

  // Create patient name lookup map
  const patientNameMap = useMemo(() => {
    const map = new Map<string, string>();
    patients.forEach(p => {
      if (p.telegram_id && p.name) {
        map.set(p.telegram_id, p.name);
      }
    });
    return map;
  }, [patients]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [countRes, recentRes, patientsRes] = await Promise.all([
          getStatsCount(),
          getRecentLogs(),
          getPatients()
        ]);
        
        setStats({ totalPatients: countRes.data.total_patients || 0 });
        setRecentData(recentRes.data.data || []);
        setPatients(Array.isArray(patientsRes.data) ? patientsRes.data : patientsRes.data?.data || []);
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

    socket.on('NEW_SYMPTOM_DATA', (data: SymptomLog) => {
      setRecentData(prev => [data, ...prev].slice(0, 50));
    });

    socket.on('disconnect', () => {
      setStatus('Koneksi Terputus.');
      setIsReady(false);
    });

    socket.on('connect', () => {
      setIsReady(true);
      setStatus('Telegram Bot Aktif');
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
      { name: 'Skala 1', value: counts['1'], color: '#22C55E' },
      { name: 'Skala 2', value: counts['2'], color: '#84CC16' },
      { name: 'Skala 3', value: counts['3'], color: '#F59E0B' },
      { name: 'Skala 4', value: counts['4'], color: '#F97316' },
      { name: 'Skala 5', value: counts['5'], color: '#EF4444' },
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
      <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Menganalisis data...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10 px-4">
      
      {/* --- HEADER DASHBOARD --- */}
      <div className="relative overflow-hidden bg-gradient-to-br from-sky-500/10 via-cyan-500/5 to-transparent dark:from-sky-500/20 dark:via-cyan-500/10 dark:to-transparent border border-sky-200/50 dark:border-sky-800/50 rounded-[2rem] p-8 md:p-12">
        {/* Decorative Glow */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-sky-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative flex flex-col items-center text-center space-y-6">
          {/* Icon */}
          <div className="p-4 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-2xl text-white shadow-xl shadow-sky-500/30 animate-pulse">
            <LayoutDashboard size={32} />
          </div>
          
          {/* Animated Title */}
          <div className="space-y-2">
            <SplitText 
              text="Bruxism Chatbot Admin Dashboard" 
              className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight"
              delay={30}
              duration={0.8}
              ease="power3.out"
              from={{ opacity: 0, y: 50, rotationX: -40 }}
              to={{ opacity: 1, y: 0, rotationX: 0 }}
            />
            <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg">Ringkasan aktivitas ChatBot dan Report gejala pasien.</p>
          </div>
        </div>
      </div>

      {/* --- STATUS BOT --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`flex items-center justify-between p-5 rounded-3xl border transition-all duration-500 shadow-sm ${
          isReady 
          ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100" 
          : "bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800 text-orange-900 dark:text-orange-100"
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
          <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500 text-white shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest">Bot Online</span>
          </div>
        )}
      </motion.div>

      {/* --- STAT CARDS --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <StatCard title="Total Pasien" value={stats.totalPatients} icon={<Users size={24} />} color="bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400" />
        <StatCard title="Gejala Tinggi (Skala 3-5)" value={summaryStats.nyeri} icon={<AlertCircle size={24} />} color="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400" />
        <StatCard title="Gejala Rendah (Skala 1-2)" value={summaryStats.normal} icon={<CheckCircle2 size={24} />} color="bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400" />
      </motion.div>

      {/* --- DIAGRAM / GRAFIK UTAMA --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="grid grid-cols-1 gap-8"
      >
        {/* Grafik Distribusi Tingkat Keparahan (Skala 1-5) */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-8 rounded-[2rem] shadow-lg border border-slate-200/50 dark:border-slate-700/50">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100 mb-8">
            <BarChart3 size={20} className="text-sky-500" /> Report Gejala Pasien
          </h3>
          <div className="flex h-80 flex-col gap-2">
            <ResponsiveContainer initialDimension={{ width: 1, height: 1 }} className="h-full">
              <ComposedChart
                data={scaleAnalysis}
                margin={{
                  left: 4,
                  right: 0,
                  top: 12,
                  bottom: 18,
                }}
                className="text-tertiary [&_.recharts-text]:text-xs"
              >
                <CartesianGrid vertical={false} stroke="currentColor" className="text-utility-neutral-100" />

                <XAxis
                  fill="currentColor"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={12}
                  interval="preserveStartEnd"
                  dataKey="name"
                >
                  <Label value="Skala" fill="currentColor" className="text-xs! font-medium" position="bottom" />
                </XAxis>

                <YAxis
                  fill="currentColor"
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  allowDecimals={false}
                  tickFormatter={(value) => Number(value).toLocaleString()}
                >
                  <Label
                    value="Jumlah Pasien"
                    fill="currentColor"
                    className="text-xs! font-medium"
                    style={{ textAnchor: "middle" }}
                    angle={-90}
                    position="insideLeft"
                  />
                </YAxis>

                <Tooltip
                  content={<ChartTooltipContent />}
                  formatter={(value) => Number(value).toLocaleString()}
                  cursor={{
                    className: "fill-utility-neutral-200/20",
                  }}
                />

                <Bar
                  isAnimationActive={false}
                  dataKey="value"
                  name="Jumlah"
                  fill="currentColor"
                  maxBarSize={55}
                  radius={[10, 10, 0, 0]}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* --- INTERAKSI TERBARU --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-8 rounded-[2rem] shadow-lg border border-slate-200/50 dark:border-slate-700/50 max-w-full"
      >
        <h3 className="mb-6 text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          Interaksi Terbaru
        </h3>
        {recentData.length === 0 ? (
          <p className="text-slate-400 dark:text-slate-500 text-sm italic text-center py-4">Belum ada data interaksi terbaru.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentData.slice(0, 6).map((log: SymptomLog, idx: number) => {
              // Look up patient name from fetched patients list
              const patientName = log.telegram_id ? patientNameMap.get(log.telegram_id) : null;
              const hasName = !!patientName;
              const displayName = patientName || log.patient?.name || "Pasien Anonim";
              
              const cardContent = (
                <div className={`group flex items-center justify-between p-4 rounded-2xl transition-all border ${hasName ? 'bg-slate-50/50 dark:bg-slate-800/50 hover:bg-sky-50 dark:hover:bg-sky-900/30 border-transparent hover:border-sky-200 dark:hover:border-sky-800 cursor-pointer' : 'bg-slate-100/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700 cursor-default opacity-60'}`}>
                  <div className="flex items-center gap-3 overflow-hidden w-full">
                    <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center shadow-sm shrink-0 text-slate-400 dark:text-slate-500">
                      <Users size={18} />
                    </div>
                    <div className="overflow-hidden w-full">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">
                          {displayName}
                        </p>
                        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 shrink-0">{log.telegram_id}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic truncate max-w-xs mt-0.5">Skala: {log.answer}</p>
                    </div>
                  </div>
                  {hasName && <ArrowRight size={14} className="text-slate-300 dark:text-slate-600 group-hover:text-sky-500 ml-2 shrink-0" />}
                </div>
              );

              return hasName ? (
                <Link key={log.id ?? `log-${idx}`} href={`/logs/${log.telegram_id}`}>
                  {cardContent}
                </Link>
              ) : (
                <div key={log.id ?? `log-${idx}`}>{cardContent}</div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="group bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 rounded-[2rem] border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all"
    >
      <div className="flex items-center gap-5">
        <div className={`p-4 rounded-2xl ${color} shadow-inner`}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">{title}</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{value.toLocaleString()}</p>
        </div>
      </div>
    </motion.div>
  );
}
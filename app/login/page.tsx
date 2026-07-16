"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAdmin } from '@/lib/api'; 
import { LockKeyhole, User, Loader2, Sun, Moon } from 'lucide-react';
import { AxiosError } from 'axios';
import { motion } from 'motion/react';
import Grainient from '@/components/Grainient';
import SplitText from '@/components/SplitText';
import { useTheme } from '@/context/ThemeContext';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true); 
    try {
      const res = await loginAdmin(form);
      localStorage.setItem('token', res.data.token); 
      router.push('/'); 
    } catch (err: unknown) { 
      if (err && typeof err === 'object' && 'isAxiosError' in err && (err as AxiosError).isAxiosError) {
        const axiosErr = err as AxiosError<{ message?: string }>;
        if (axiosErr.response?.data?.message) {
          setError(axiosErr.response.data.message);
        } else {
          setError('Login Gagal. Cek koneksi backend.');
        }
      } else {
        setError('Login Gagal. Cek koneksi backend.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`flex min-h-screen items-center justify-center relative overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-slate-100'}`}>
      {/* Grainient Animated Background */}
      <div className="absolute inset-0 z-0">
        <Grainient
          color1={isDark ? "#1e293b" : "#0EA5E9"}
          color2={isDark ? "#0f172a" : "#06B6D4"}
          color3={isDark ? "#334155" : "#0284C7"}
          timeSpeed={0.2}
          warpStrength={0.8}
          warpFrequency={4.0}
          warpSpeed={1.5}
          warpAmplitude={40.0}
          grainAmount={0.05}
          contrast={isDark ? 0.8 : 1.2}
          saturation={isDark ? 0.5 : 1.1}
        />
      </div>
      {/* Overlay for readability */}
      <div className={`absolute inset-0 z-0 ${isDark ? 'bg-slate-900/60' : 'bg-slate-900/40'}`} />

      <motion.div 
        className="relative z-10 w-full max-w-sm px-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div 
          className={`${isDark ? 'bg-slate-800/90' : 'bg-white/20'} backdrop-blur-xl rounded-3xl ${isDark ? 'shadow-[0_25px_60px_rgba(0,0,0,0.5)]' : 'shadow-[0_25px_60px_rgba(0,0,0,0.2)]'} ${isDark ? 'border border-slate-700/50' : 'border border-white/30'} overflow-hidden`}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        >
          {/* Theme Toggle - Top Right */}
          <button
            onClick={toggleTheme}
            className={`absolute top-4 right-4 p-2 rounded-full ${isDark ? 'bg-slate-700/50 hover:bg-slate-600/50' : 'bg-white/20 hover:bg-white/30'} transition-colors`}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-700" />
            )}
          </button>
          <div className="text-center mb-8 pt-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <img src="/logo.png" alt="Bruxism" className="w-30 h-30 object-contain mx-auto" />
            </motion.div>
            <div className="mt-6">
              <SplitText 
                text="Welcome Back, Admin!" 
                className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-black'}`}
                splitType="chars"
                delay={40}
                duration={2}
              />
            </div>
            <motion.p 
              className={`mt-3 text-sm ${isDark ? 'text-slate-400' : 'text-black/60'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              Please enter your account to access <span className={`font-semibold ${isDark ? 'text-blue-400' : 'text-black'}`}>Bruxism Admin</span>
            </motion.p>
          </div>

          {error && (
            <motion.div 
              className="mx-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-4 text-sm"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </motion.div>
          )}

          <motion.form 
            onSubmit={handleLogin} 
            className="space-y-4 px-4 pb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <motion.div 
              className="relative group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <User className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-black/50'} group-focus-within:text-blue-500 transition-colors w-6 h-6`} />
              <input
                type="text"
                placeholder="Username"
                required
                className={`w-full pl-14 pr-4 py-4 ${isDark ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400' : 'bg-white/30 border-white/30 text-black placeholder:text-black/40'} border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all`}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </motion.div>

            <motion.div 
              className="relative group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.7 }}
            >
              <LockKeyhole className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-black/50'} group-focus-within:text-blue-500 transition-colors w-6 h-6`} />
              <input
                type="password"
                placeholder="Password"
                required
                className={`w-full pl-14 pr-4 py-4 ${isDark ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400' : 'bg-white/30 border-white/30 text-black placeholder:text-black/40'} border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all`}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </motion.div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-blue-400 disabled:to-cyan-400 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.8 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Login"}
            </motion.button>
          </motion.form>

          <motion.p 
            className={`pb-6 text-center text-xs ${isDark ? 'text-slate-500' : 'text-black/40'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 1 }}
          >
            &copy; 2026 Bruxism Admin Dashboard. All rights reserved.
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}

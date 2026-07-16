"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAdmin } from '@/lib/api'; 
import { LockKeyhole, User, Loader2, Bot } from 'lucide-react';
import { AxiosError } from 'axios';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] border border-white overflow-hidden p-8 md:p-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-200">
              <LockKeyhole className="text-white w-8 h-8" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Welcome Back</h2>
            <p className="text-gray-500 mt-2 text-sm">Please enter your account to access <span className="font-semibold text-blue-600">Bruxism Admin</span></p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 text-sm animate-in fade-in slide-in-from-top-1">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
              <input
                type="text"
                placeholder="Username"
                required
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-700"
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>

            <div className="relative group">
              <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
              <input
                type="password"
                placeholder="Password"
                required
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-700"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
            </button>
          </form>

          <div className="mt-8 p-4 bg-slate-50 rounded-xl text-center">
            <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
              <Bot size={18} />
              <span>Telegram Bot aktif untuk menerima data pasien</span>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            &copy; 2026 Bruxism Admin Dashboard. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
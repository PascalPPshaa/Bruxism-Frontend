"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAdmin } from '@/lib/api'; // Pastikan path ini benar
import WhatsAppConnection from '@/component/WhatsAppConnection'; // Sesuaikan path komponen Anda
import { LockKeyhole, User, Loader2, QrCode } from 'lucide-react';
import { AxiosError } from 'axios';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true); // Tambahkan loading state saat submit
    try {
      const res = await loginAdmin(form);
      localStorage.setItem('token', res.data.token); 
      router.push('/'); 
    } catch (err: unknown) { // Tipe error diubah dari any ke unknown
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
      
      {/* Container Utama diperlebar (max-w-5xl) untuk menampung 2 kolom */}
      <div className="w-full max-w-5xl">
        
        {/* Card Wrapper dengan Grid Layout */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] border border-white overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[600px]">
          
          {/* KOLOM KIRI: FORM LOGIN (UI ASLI TIDAK DIRUBAH) */}
          <div className="p-8 md:p-12 flex flex-col justify-center">
            
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-200">
                <LockKeyhole className="text-white w-8 h-8" />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Welcome Back</h2>
              <p className="text-gray-500 mt-2 text-sm">Please enter your account to access <span className="font-semibold text-blue-600">Bruxism Admin</span></p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 text-sm animate-in fade-in slide-in-from-top-1">
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Input Username */}
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

              {/* Input Password */}
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

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-xs text-gray-400">
              &copy; 2026 Bruxism Admin Dashboard. All rights reserved.
            </p>
          </div>

          {/* KOLOM KANAN: WHATSAPP CONTAINER (BARU) */}
          <div className="hidden md:flex flex-col items-center justify-center bg-blue-50/50 p-8 border-l border-white relative">
            {/* Dekorasi Background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-300 rounded-full blur-3xl opacity-20 -ml-16 -mb-16"></div>

            <div className="relative z-10 w-full max-w-xs text-center">
              <div className="mb-6 inline-flex items-center justify-center w-12 h-12 bg-white rounded-xl shadow-sm">
                 <QrCode className="text-blue-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Server Connection</h3>
              <p className="text-sm text-gray-500 mb-8">
                Pastikan bot server terhubung agar Dashboard dapat menerima data real-time.
              </p>
              
              {/* Komponen WhatsApp yang kita buat tadi */}
              <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                <WhatsAppConnection />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
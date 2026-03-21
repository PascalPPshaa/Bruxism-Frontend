"use client";
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '../component/Sidebarku'; // Sesuaikan path import Anda
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token && pathname !== '/login') {
      router.push('/login');
    } else {
      // Avoid calling setState synchronously within an effect
      Promise.resolve().then(() => setIsLoading(false));
    }
  }, [pathname, router]);

  const showSidebar = pathname !== '/login';

  // Cegah "flicker" konten sebelum redirect selesai
  if (isLoading && pathname !== '/login') {
    return (
      <html lang="id">
        <body className="bg-slate-100 flex items-center justify-center min-h-screen">
          <p className="animate-pulse font-medium text-slate-500">Checking session...</p>
        </body>
      </html>
    );
  }

  return (
    <html lang="id">
      <body className="bg-slate-50 antialiased">
        <div className="flex">
          {/* Sidebar hanya dirender jika bukan di halaman login */}
          {showSidebar && <Sidebar />}

          {/* Konten Utama */}
          <main className={`flex-1 transition-all duration-300 ${showSidebar ? 'ml-64 p-8' : ''}`}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
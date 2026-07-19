"use client";
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ThemeProvider } from '../context/ThemeContext';
import SidebarComponent from '../component/Sidebarku';
import BottomNav from '../component/BottomNav';
import './globals.css';
import { Noto_Sans, Playfair_Display } from "next/font/google";
import { cn } from "@/lib/utils";
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/animate-ui/components/radix/sidebar';

const playfairDisplayHeading = Playfair_Display({ subsets: ['latin'], variable: '--font-heading' });
const notoSans = Noto_Sans({ subsets: ['latin'], variable: '--font-sans' });

// Tombol Toggle Sidebar ditempel di pojok kiri atas konten utama secara fixed/sticky
function SidebarToggle() {
  return (
    <div className="sticky top-4 z-40 flex h-0 items-center px-4">
      <SidebarTrigger className="h-10 w-10 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center" />
    </div>
  );
}

function MainContent({ children }: { children: React.ReactNode }) {
  return (
    // min-w-0 penting agar komponen chart/table di dalamnya tidak merusak lebar layar (overflow)
    <div className="flex-1 p-4 pt-6 pb-20 md:pb-8 max-w-7xl mx-auto w-full min-w-0">
      {children}
    </div>
  );
}

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* SidebarComponent bawaan provider akan menempati porsi layout kiri secara otomatis */}
      <SidebarComponent />
      
      {/* SidebarInset bertindak sebagai pembungkus area kanan di dalam SidebarProvider */}
      <SidebarInset className="flex flex-col bg-slate-50 dark:bg-slate-950 min-w-0 transition-all duration-300">
        <SidebarToggle />
        <MainContent>{children}</MainContent>
      </SidebarInset>
      
      {/* BottomNav untuk tampilan mobile tetap di bawah */}
      <BottomNav />
    </>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token && pathname !== '/login') {
      router.push('/login');
    } else {
      Promise.resolve().then(() => setIsLoading(false));
    }
  }, [pathname, router]);

  const showSidebar = pathname !== '/login';

  if (isLoading && pathname !== '/login') {
    return (
      <html lang="id" className={cn("font-sans", notoSans.variable, playfairDisplayHeading.variable)}>
        <body className="bg-slate-100 dark:bg-slate-900 flex items-center justify-center min-h-screen">
          <p className="animate-pulse font-medium text-slate-500 dark:text-slate-400">Checking session...</p>
        </body>
      </html>
    );
  }

  return (
    <html lang="id" className={cn("font-sans", notoSans.variable, playfairDisplayHeading.variable)} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <title>Bruxism Admin</title>
      </head>
      <body className="bg-slate-50 dark:bg-slate-950 antialiased min-h-screen">
        <ThemeProvider>
          {showSidebar ? (
            <SidebarProvider>
              <AppShell>{children}</AppShell>
            </SidebarProvider>
          ) : (
            <main className="min-h-screen w-full">{children}</main>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
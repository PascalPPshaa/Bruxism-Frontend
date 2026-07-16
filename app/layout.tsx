"use client";
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ThemeProvider } from '../context/ThemeContext';
import SidebarComponent from '../component/Sidebarku';
import BottomNav from '../component/BottomNav';
import './globals.css';
import { Noto_Sans, Playfair_Display } from "next/font/google";
import { cn } from "@/lib/utils";
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';

const playfairDisplayHeading = Playfair_Display({subsets:['latin'],variable:'--font-heading'});
const notoSans = Noto_Sans({subsets:['latin'],variable:'--font-sans'});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token')
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
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <title>Bruxism Admin</title>
      </head>
      <body className="bg-slate-50 dark:bg-slate-950 antialiased">
        <ThemeProvider>
          {showSidebar ? (
            <SidebarProvider>
              <SidebarComponent />
              {/* Floating Sidebar Trigger */}
              <div className="fixed left-0 top-1/2 -translate-y-1/2 z-50 ml-2">
                <SidebarTrigger className="h-10 w-10 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all" />
              </div>
              <SidebarInset>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-6 pb-20 md:pb-4 max-w-7xl mx-auto w-full">
                  {children}
                </div>
              </SidebarInset>
              <BottomNav />
            </SidebarProvider>
          ) : (
            children
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
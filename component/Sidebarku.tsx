// import Link from 'next/link'
// import { useRouter, usePathname, useSearchParams } from 'next/navigation';
// import {
//   Users,
//   MessageSquare,
//   ClipboardList,
//   LayoutDashboard,
//   LogOut,
// } from 'lucide-react'

// export default function Sidebar() {
//   const router = useRouter()

//   const handleLogout = () => {
//     localStorage.removeItem('token')
//     router.push('/login')
//   }

//   const menu = [
//     { name: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/' },
//     { name: 'Pasien', icon: <Users size={20} />, href: '/patients' },
//     { name: 'Pertanyaan', icon: <MessageSquare size={20} />, href: '/questions' },
//     { name: 'Log Gejala', icon: <ClipboardList size={20} />, href: '/logs' },
//   ]

//   return (
//     <aside className="w-64 bg-slate-900 text-white h-screen p-4 fixed flex flex-col justify-between">
//       <div>
//         <div className="mb-10 px-2 text-xl font-bold border-b border-slate-700 pb-4">
//           Bruxism Admin
//         </div>

//         <nav className="space-y-1">
//           {menu.map((item) => (
//             <Link
//               key={item.name}
//               href={item.href}
//               className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg transition"
//             >
//               {item.icon}
//               <span>{item.name}</span>
//             </Link>
//           ))}
//         </nav>
//       </div>

//       <button
//         onClick={handleLogout}
//         className="flex items-center gap-3 p-3 w-full text-red-400 hover:bg-red-500/10 rounded-lg transition"
//       >
//         <LogOut size={20} />
//         <span>Logout</span>
//       </button>
//     </aside>
//   )
// }

'use client' // WAJIB: Baris ini harus ada di paling atas!

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Users,
  MessageSquare,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  X
} from 'lucide-react'

export default function Sidebar() {
  const router = useRouter()
  // Kita set default false agar tidak menabrak konten saat pertama load di HP
  const [isOpen, setIsOpen] = useState(true)

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  const menu = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/' },
    { name: 'Pasien', icon: <Users size={20} />, href: '/patients' },
    { name: 'Pertanyaan', icon: <MessageSquare size={20} />, href: '/questions' },
    { name: 'Log Gejala', icon: <ClipboardList size={20} />, href: '/logs' },
  ]

  return (
    <>
      {/* Tombol Garis 3 (Hanya muncul kalau sidebar tertutup) */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-md shadow-lg hover:bg-slate-800 transition-all"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 left-0 h-screen bg-slate-900 text-white z-40 transition-all duration-300 ease-in-out flex flex-col justify-between p-4 ${
          isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full'
        }`}
      >
        {/* Bagian Atas Sidebar */}
        <div className={!isOpen ? 'hidden' : 'block'}>
          <div className="mb-10 px-2 flex items-center justify-between border-b border-slate-700 pb-4">
            <span className="text-xl font-bold whitespace-nowrap">Bruxism Admin</span>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-slate-800 rounded-md transition"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-1">
            {menu.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg transition group"
              >
                <span className="shrink-0">{item.icon}</span>
                <span className="whitespace-nowrap">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Bagian Bawah (Logout) */}
        <div className={!isOpen ? 'hidden' : 'block'}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 w-full text-red-400 hover:bg-red-500/10 rounded-lg transition"
          >
            <LogOut size={20} className="shrink-0" />
            <span className="whitespace-nowrap">Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay: Biar kalau di klik luar sidebar, sidebarnya tutup (Khusus Mobile) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
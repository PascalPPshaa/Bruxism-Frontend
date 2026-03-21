import Link from 'next/link'
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Users,
  MessageSquare,
  ClipboardList,
  LayoutDashboard,
  LogOut,
} from 'lucide-react'

export default function Sidebar() {
  const router = useRouter()

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
    <aside className="w-64 bg-slate-900 text-white h-screen p-4 fixed flex flex-col justify-between">
      <div>
        <div className="mb-10 px-2 text-xl font-bold border-b border-slate-700 pb-4">
          Bruxism Admin
        </div>

        <nav className="space-y-1">
          {menu.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg transition"
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 p-3 w-full text-red-400 hover:bg-red-500/10 rounded-lg transition"
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </aside>
  )
}

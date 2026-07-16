'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  ClipboardList,
} from 'lucide-react'

const menu = [
  { name: 'Home', icon: LayoutDashboard, href: '/' },
  { name: 'Pasien', icon: Users, href: '/patients' },
  { name: 'Tanya', icon: MessageSquare, href: '/questions' },
  { name: 'Log', icon: ClipboardList, href: '/logs' },
]

export default function BottomNav() {
  const pathname = usePathname()
  const activeIndex = menu.findIndex(item => item.href === pathname)

  return (
    <nav className="fixed bottom-4 left-0 right-0 z-50 md:hidden">
      <div className="flex justify-center px-4">
        <div className="relative flex items-center gap-1 px-2 py-2 rounded-full bg-sidebar/95 backdrop-blur-md border border-sidebar-border shadow-lg">
        {/* Animated indicator - each item is ~72px wide (56px content + 16px padding) */}
        <motion.div
          className="absolute top-1 bottom-1 bg-primary rounded-full"
          initial={false}
          animate={{
            left: `${(activeIndex * 100) / 4}%`,
            width: '25%',
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30,
          }}
        />
        {menu.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`relative z-10 flex flex-col items-center justify-center gap-1 w-16 h-12 py-2 rounded-full transition-colors duration-200 ${
                isActive
                  ? 'text-primary-foreground'
                  : 'text-sidebar-foreground hover:text-foreground'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          )
        })}
        </div>
      </div>
    </nav>
  )
}

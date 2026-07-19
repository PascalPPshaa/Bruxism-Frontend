'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
  Users,
  MessageSquare,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Sun,
  Moon,
  ChevronRight,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  useSidebar,
} from '@/components/animate-ui/components/radix/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const menu = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { name: 'Pasien', icon: Users, href: '/patients' },
  { name: 'Pertanyaan', icon: MessageSquare, href: '/questions' },
  { name: 'Log Gejala', icon: ClipboardList, href: '/logs' },
]

export default function SidebarComponent() {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const { state } = useSidebar()

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  return (
    <Sidebar variant="floating" collapsible="icon" className="transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <img src="/logo.png" alt="Bruxism" className="w-8 h-8 rounded-xl object-contain" />
          <span className="text-lg font-bold text-sidebar-foreground transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] whitespace-nowrap" style={{ opacity: state === "collapsed" ? 0 : 1, width: state === "collapsed" ? "0" : "auto", overflow: "hidden" }}>Bruxism</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarMenu>
            {menu.map((item) => {
              const isActive = pathname === item.href
              return (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={isActive} tooltip={item.name}>
                    <Link href={item.href}>
                      <item.icon />
                      <span className="transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] whitespace-nowrap" style={{ opacity: state === "collapsed" ? 0 : 1, width: state === "collapsed" ? "0" : "auto", overflow: "hidden" }}>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={toggleTheme} tooltip={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}>
              {theme === 'dark' ? <Sun /> : <Moon />}
              <span className="transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] whitespace-nowrap" style={{ opacity: state === "collapsed" ? 0 : 1, width: state === "collapsed" ? "0" : "auto", overflow: "hidden" }}>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="text-red-500 hover:text-red-600" tooltip="Logout">
              <LogOut />
              <span className="transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] whitespace-nowrap" style={{ opacity: state === "collapsed" ? 0 : 1, width: state === "collapsed" ? "0" : "auto", overflow: "hidden" }}>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
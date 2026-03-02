'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Activity,
  BarChart3,
  Target,
  User,
  Settings,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const menuItems = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  {
    label: 'การออกกำลังกาย',
    icon: Activity,
    href: '/workouts',
  },
  {
    label: 'สถิติ',
    icon: BarChart3,
    href: '/analytics',
  },
  {
    label: 'เป้าหมาย',
    icon: Target,
    href: '/goals',
  },
  {
    label: 'โปรไฟล์',
    icon: User,
    href: '/profile',
  },
  {
    label: 'ตั้งค่า',
    icon: Settings,
    href: '/settings',
  },
]

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 transform border-r bg-white transition-transform duration-200 ease-in-out lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Mobile Header */}
        <div className="flex h-16 items-center justify-between border-b px-4 lg:hidden">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏃</span>
            <span className="font-bold text-xl">Fitness Tracker</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={24} />
          </Button>
        </div>

        {/* Menu Items */}
        <nav className="flex flex-col gap-1 p-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <Icon size={20} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t p-4">
          <div className="rounded-lg bg-blue-50 p-3">
            <p className="text-xs font-medium text-blue-700">
              💡 Tips
            </p>
            <p className="mt-1 text-xs text-blue-600">
              ออกกำลังกายสม่ำเสมอจะช่วยให้สุขภาพดีขึ้น!
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
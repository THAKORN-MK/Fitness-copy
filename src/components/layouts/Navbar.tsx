'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/lib/store/authStore'
import { toast } from 'react-hot-toast'
import { 
  User, 
  LogOut, 
  Settings, 
  Bell,
  Menu,
  X
} from 'lucide-react'

interface NavbarProps {
  onMenuClick: () => void
  isMobileMenuOpen: boolean
}

export default function Navbar({ onMenuClick, isMobileMenuOpen }: NavbarProps) {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      logout()
      toast.success('ออกจากระบบสำเร็จ')
      router.push('/login')
    } catch (error) {
      toast.error('เกิดข้อผิดพลาด')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <nav className="sticky top-0 z-50 border-b bg-white">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left: Menu Button + Logo */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
          
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">🏃</span>
            <span className="hidden font-bold text-xl md:inline-block">
              Fitness Tracker
            </span>
          </Link>
        </div>

        {/* Right: Notifications + User Menu */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  {user?.avatarUrl ? (
                    <img 
                      src={user.avatarUrl} 
                      alt={user.username} 
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <User size={18} />
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">{user?.name || user?.username}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>บัญชีของฉัน</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  โปรไฟล์
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  ตั้งค่า
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {isLoggingOut ? 'กำลังออกจากระบบ...' : 'ออกจากระบบ'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
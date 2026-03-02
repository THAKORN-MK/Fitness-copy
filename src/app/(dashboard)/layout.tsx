'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layouts/Navbar'
import Sidebar from '@/components/layouts/Sidebar'
import { useAuthStore } from '@/lib/store/authStore'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, token } = useAuthStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // ตรวจสอบ authentication
  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push('/login')
    }
  }, [isAuthenticated, token, router])

  // ถ้ายังไม่ login ไม่แสดงอะไร
  if (!isAuthenticated || !token) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />
      
      <div className="flex">
        <Sidebar
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
        
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
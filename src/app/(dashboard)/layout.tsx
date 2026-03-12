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
  const [hydrated, setHydrated] = useState(false)

  // ✅ รอให้ Zustand hydrate จาก localStorage ก่อนค่อย redirect
  useEffect(() => { setHydrated(true) }, [])

  useEffect(() => {
    if (hydrated && (!isAuthenticated || !token)) {
      router.push('/login')
    }
  }, [hydrated, isAuthenticated, token, router])

  if (!hydrated) return null
  if (!isAuthenticated || !token) return null

  return (
    <div style={{ minHeight:'100vh', background:'#070712', position:'relative' }}>

      {/* ── glow blobs ── */}
      <div aria-hidden style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }}>

        {/* บนขวา — indigo/violet */}
        <div style={{
          position:'absolute', top:'-18vh', right:'-12vw',
          width:'60vw', height:'60vw', maxWidth:760, maxHeight:760,
          borderRadius:'50%',
          background:'radial-gradient(circle, rgba(109,88,245,0.22) 0%, rgba(139,68,200,0.12) 40%, transparent 70%)',
          filter:'blur(72px)',
        }}/>

        {/* ล่างซ้าย — pink/purple */}
        <div style={{
          position:'absolute', bottom:'-18vh', left:'-12vw',
          width:'60vw', height:'60vw', maxWidth:760, maxHeight:760,
          borderRadius:'50%',
          background:'radial-gradient(circle, rgba(168,40,200,0.20) 0%, rgba(99,40,180,0.10) 40%, transparent 70%)',
          filter:'blur(72px)',
        }}/>

        {/* dot grid */}
        <div style={{
          position:'absolute', inset:0,
          backgroundImage:'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize:'32px 32px',
          maskImage:'radial-gradient(ellipse 90% 80% at 50% 50%, black 20%, transparent 100%)',
          WebkitMaskImage:'radial-gradient(ellipse 90% 80% at 50% 50%, black 20%, transparent 100%)',
        }}/>
      </div>

      {/* ── content ── */}
      <div style={{ position:'relative', zIndex:1 }}>
        {/* Navbar fixed ติดบน */}
        <div style={{ position:'fixed', top:0, left:0, right:0, zIndex:20 }}>
          <Navbar
            onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            isMobileMenuOpen={isMobileMenuOpen}
          />
        </div>

        {/* ดัน content ลงมาให้พ้น Navbar (ความสูง navbar ~60px) */}
        <div style={{ display:'flex', paddingTop:'60px' }}>
          <div style={{ position:'relative', zIndex:10 }}>
            <Sidebar
              isOpen={isMobileMenuOpen}
              onClose={() => setIsMobileMenuOpen(false)}
            />
          </div>
          <main style={{
            flex:1,
            padding:'clamp(16px, 3vw, 32px)',
            minHeight:'calc(100vh - 60px)',
          }}>
            <div style={{ maxWidth:1280, margin:'0 auto' }}>
              {children}
            </div>
          </main>
        </div>
      </div>

    </div>
  )
}
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Activity, BarChart3,
  Target, User, Settings, X, Zap
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

type MenuItem = {
  label: string
  icon: LucideIcon
  href: string
  badge?: string
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard',       icon: LayoutDashboard, href: '/dashboard' },
  { label: 'เป้าหมาย',       icon: Target,          href: '/goals'     },
  { label: 'การออกกำลังกาย', icon: Activity,        href: '/workouts'  },
  { label: 'สถิติ',           icon: BarChart3,       href: '/analytics' },
  
  { label: 'โปรไฟล์',        icon: User,            href: '/profile'   },
  { label: 'ตั้งค่า',         icon: Settings,        href: '/settings'  },
]

const SIDEBAR_W = 240

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@700;800&family=Sarabun:wght@400;500;600&display=swap');

        /* ── spacer: ดัน main content บน desktop ── */
        .sb-spacer {
          display: none;
          width: ${SIDEBAR_W}px;
          flex-shrink: 0;
        }
        @media (min-width: 1024px) { .sb-spacer { display: block; } }

        /* ── overlay (mobile only) ── */
        .sb-overlay {
          position: fixed; inset: 0; z-index: 40;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(4px);
          animation: sbFadeIn 0.2s ease;
        }
        @keyframes sbFadeIn { from{opacity:0} to{opacity:1} }
        @media (min-width: 1024px) { .sb-overlay { display: none !important; } }

        /* ── sidebar shell ── */
        .sb {
          position: fixed; left: 0; top: 0; z-index: 50;
          height: 100dvh; width: ${SIDEBAR_W}px;
          display: flex; flex-direction: column;
          font-family: 'Sarabun', sans-serif;
          background: rgba(10,10,20,0.97);
          border-right: 1px solid rgba(129,140,248,0.1);
          backdrop-filter: blur(24px);
          transform: translateX(-100%);
          transition: transform 0.22s cubic-bezier(0.4,0,0.2,1);
        }
        .sb.open { transform: translateX(0); }

        @media (min-width: 1024px) {
          .sb {
            top: 60px;
            height: calc(100vh - 60px);
            transform: translateX(0) !important;
          }
        }

        /* ── mobile header row ── */
        .sb-mhd {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 18px; height: 60px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }
        @media (min-width: 1024px) { .sb-mhd { display: none; } }

        .sb-logo { display: flex; align-items: center; gap: 9px; text-decoration: none; }
        .sb-logo-icon {
          width: 30px; height: 30px; border-radius: 9px;
          background: linear-gradient(135deg,#5b21b6,#7c3aed,#a21caf);
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; box-shadow: 0 3px 12px rgba(91,33,182,.4);
        }
        .sb-logo-name {
          font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 800;
          color: #fff; letter-spacing: -.5px;
        }
        .sb-close {
          width: 32px; height: 32px; border-radius: 9px; border: none; cursor: pointer;
          background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.08);
          color: rgba(255,255,255,.55); display: flex; align-items: center; justify-content: center;
          transition: all .18s;
        }
        .sb-close:hover { background: rgba(248,113,113,.12); color: #f87171; border-color: rgba(248,113,113,.2); }

        .sb-section-lbl {
          font-size: 15px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
          color: rgba(255,255,255,.28); padding: 30px 18px 8px;
        }

        .sb-nav { display: flex; flex-direction: column; gap: 2px; padding: 0 10px; flex: 1; overflow-y: auto; }
        .sb-nav::-webkit-scrollbar { width: 0; }

        .sb-item {
          display: flex; align-items: center; gap: 11px;
          padding: 10px 12px; border-radius: 13px;
          text-decoration: none; transition: all .16s;
          position: relative; overflow: hidden;
          color: rgba(255,255,255,.5);
          font-size: 14px; font-weight: 500;
          border: 1px solid transparent;
        }
        .sb-item:hover {
          background: rgba(129,140,248,.1);
          color: rgba(255,255,255,.85);
          border-color: rgba(129,140,248,.15);
        }
        .sb-item.active {
          background: linear-gradient(135deg, rgba(91,33,182,.35), rgba(162,28,175,.25));
          border-color: rgba(129,140,248,.25);
          color: #fff;
          box-shadow: 0 4px 16px rgba(91,33,182,.2);
        }
        .sb-item.active::before {
          content: ''; position: absolute; left: 0; top: 20%; bottom: 20%;
          width: 3px; border-radius: 0 3px 3px 0;
          background: linear-gradient(180deg, #818cf8, #ec4899);
        }
        .sb-icon {
          width: 34px; height: 34px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: all .16s;
          background: rgba(255,255,255,.05);
        }
        .sb-item.active .sb-icon {
          background: rgba(129,140,248,.2); color: #a78bfa;
          box-shadow: 0 2px 10px rgba(129,140,248,.25);
        }
        .sb-item:hover .sb-icon { background: rgba(129,140,248,.12); }
        .sb-label { flex: 1; font-family: 'Sarabun', sans-serif; }
        .sb-item.active .sb-label { font-weight: 600; }
        .sb-badge {
          font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 500;
          background: rgba(251,191,36,.15); color: #fbbf24;
          border: 1px solid rgba(251,191,36,.25);
          border-radius: 6px; padding: 2px 7px; letter-spacing: .3px;
        }

        .sb-tip {
          margin: 12px 10px 16px; border-radius: 16px; padding: 14px 16px;
          background: linear-gradient(135deg, rgba(76,29,149,.4), rgba(109,40,217,.3), rgba(162,33,175,.25));
          border: 1px solid rgba(129,140,248,.18);
          position: relative; overflow: hidden; flex-shrink: 0;
        }
        .sb-tip::before {
          content: ''; position: absolute; top: -20px; right: -20px;
          width: 70px; height: 70px; border-radius: 50%;
          background: rgba(255,255,255,.04); pointer-events: none;
        }
        .sb-tip-head {
          display: flex; align-items: center; gap: 6px;
          font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 800;
          color: #a78bfa; margin-bottom: 6px;
        }
        .sb-tip-body { font-size: 12px; color: rgba(255,255,255,.55); line-height: 1.55; }
      `}</style>

      {/* spacer ดัน main content ให้พ้น sidebar บน desktop */}
      <div className="sb-spacer" aria-hidden/>

      {/* overlay mobile */}
      {isOpen && <div className="sb-overlay" onClick={onClose}/>}

      <aside className={`sb${isOpen ? ' open' : ''}`}>
        {/* mobile header */}
        <div className="sb-mhd">
          <Link href="/dashboard" className="sb-logo" onClick={onClose}>
            <div className="sb-logo-icon">🏃</div>
            <span className="sb-logo-name">RunTrack</span>
          </Link>
          <button className="sb-close" onClick={onClose}><X size={16}/></button>
        </div>

        <div className="sb-section-lbl">เมนูหลัก</div>

        <nav className="sb-nav">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} onClick={onClose}
                className={`sb-item${isActive ? ' active' : ''}`}>
                <div className="sb-icon"><Icon size={16}/></div>
                <span className="sb-label">{item.label}</span>
                {item.badge && <span className="sb-badge">{item.badge}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="sb-tip">
          <div className="sb-tip-head"><Zap size={12}/> เคล็ดลับ</div>
          <div className="sb-tip-body">ออกกำลังกายสม่ำเสมอจะช่วยให้สุขภาพดีขึ้น!</div>
        </div>
      </aside>
    </>
  )
}
'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/authStore'
import { toast } from 'react-hot-toast'
import { User, LogOut, Settings, Bell, Menu, X, ChevronDown } from 'lucide-react'

interface NavbarProps {
  onMenuClick: () => void
  isMobileMenuOpen: boolean
}

export default function Navbar({ onMenuClick, isMobileMenuOpen }: NavbarProps) {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    setDropdownOpen(false)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      logout()
      toast.success('ออกจากระบบสำเร็จ')
      router.push('/login')
    } catch {
      toast.error('เกิดข้อผิดพลาด')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const initials = (user?.name || user?.username || '?')
    .split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@700;800&family=Sarabun:wght@400;500;600&display=swap');

        /* ── navbar shell ── */
        .nb {
          position: sticky; top: 0; z-index: 50;
          font-family: 'Sarabun', sans-serif;
          background: rgba(10,10,20,0.88);
          border-bottom: 1px solid rgba(129,140,248,0.1);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-radius: 0 0 40px 0px;
          padding: 10px 24px;
        }

        .nb-inner {
          display: flex; align-items: center; justify-content: space-between;
          height: 60px; padding: 0 22px;
        }

        /* ── left ── */
        .nb-left { display: flex; align-items: center; gap: 12px; }

        .nb-burger {
          width: 36px; height: 36px; border-radius: 10px; border: none; cursor: pointer;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.55);
          display: flex; align-items: center; justify-content: center;
          transition: all 0.18s;
        }
        .nb-burger:hover {
          background: rgba(129,140,248,0.14);
          border-color: rgba(129,140,248,0.3);
          color: #fff;
        }
        @media (min-width: 1024px) { .nb-burger { display: none; } }

        .nb-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .nb-logo-icon {
          width: 50px; height: 50px; border-radius: 10px;
          background: linear-gradient(135deg, #5b21b6, #7c3aed, #a21caf);
          display: flex; align-items: center; justify-content: center;
          font-size: 30px;
          color: #fff;
          box-shadow: 0 4px 16px rgba(91,33,182,0.45);
          flex-shrink: 0;
        }
        .nb-logo-name {
          font-family: 'Syne', sans-serif;
          font-size: 20px; font-weight: 800;
          letter-spacing: -0.5px; color: #fff;
          padding: 0px 15px;
        }
        @media (max-width: 480px) { .nb-logo-name { display: none; } }

        /* ── right ── */
        .nb-right { display: flex; align-items: center; gap: 8px; }

        /* notif */
        .nb-notif-wrap { position: relative; 
          padding: 0px 5px;
        }
        .nb-notif-btn {
          width: 36px; height: 36px; border-radius: 10px; border: none; cursor: pointer;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.55);
          display: flex; align-items: center; justify-content: center;
          transition: all 0.18s; position: relative;
        }
        .nb-notif-btn:hover {
          background: rgba(129,140,248,0.14);
          border-color: rgba(129,140,248,0.3);
          color: #fff;
        }
        .nb-notif-dot {
          position: absolute; top: 7px; right: 7px;
          width: 8px; height: 8px; border-radius: 50%;
          background: #ec4899;
          box-shadow: 0 0 7px rgba(236,72,153,0.85);
          border: 1.5px solid rgba(10,10,20,1);
        }

        /* ── dropdown shell (shared) ── */
        .nb-drop {
          position: absolute; top: calc(100% + 10px); right: 0;
          background: rgba(13,13,26,0.97);
          border: 1px solid rgba(129,140,248,0.18);
          border-radius: 18px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.7);
          backdrop-filter: blur(24px);
          overflow: hidden;
          animation: nbDropIn 0.16s ease;
          z-index: 100;
        }
        @keyframes nbDropIn {
          from { opacity: 0; transform: translateY(-7px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }

        /* notif dropdown */
        .nb-notif-drop { width: 280px; }
        .nb-notif-head {
          padding: 10px 30px 11px;
          font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 800; color: #fff;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .nb-notif-empty {
          padding: 28px 18px; text-align: center;
          font-size: 13px; color: rgba(255,255,255,0.28);
          
        }

        /* user button */
        .nb-user-wrap { position: relative; 
        padding: 4px 1px 4px 4px;
        }
        .nb-user-btn {
          display: flex; align-items: center; gap: 9px;
          padding: 4px 10px 4px 4px;
          border-radius: 12px; border: none; cursor: pointer;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.07);
          transition: all 0.18s;
        }
        .nb-user-btn:hover {
          background: rgba(129,140,248,0.1);
          border-color: rgba(129,140,248,0.22);
        }

        .nb-avatar {
          width: 40px; height: 40px; border-radius: 9px; overflow: hidden; flex-shrink: 0;
          background: linear-gradient(135deg, #5b21b6, #7c3aed, #a21caf);
          display: flex; align-items: center; justify-content: center;
          /* DM Mono for initials — crisp + readable */
          font-family: 'DM Mono', monospace;
          font-size: 12px; font-weight: 500; color: #fff;
          box-shadow: 0 2px 12px rgba(91,33,182,0.4);
          letter-spacing: -0.3px;
        }
        .nb-avatar img { width: 100%; height: 100%; object-fit: cover; }

        .nb-uinfo { text-align: left; }
        .nb-uname {
          font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 700; color: #fff;
          line-height: 1.2;
        }
        .nb-uemail {
          font-size: 13px; color: rgba(255,255,255,0.32); line-height: 1.2;
          /* email in DM Mono — like reference app monospace tags */
          font-family: 'DM Mono', monospace; letter-spacing: -0.2px;
        }
        @media (max-width: 640px) { .nb-uinfo { display: none; } }

        .nb-chevron { color: rgba(255,255,255,0.3); transition: transform 0.2s; }
        .nb-chevron.open { transform: rotate(180deg); }
        @media (max-width: 640px) { .nb-chevron { display: none; } }

        /* user dropdown */
        .nb-user-drop { min-width: 220px; }

        .nb-dd-hdr {
          padding: 14px 16px 12px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .nb-dd-hdr-name {
          font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 800; color: #fff; margin-bottom: 2px;
        }
        .nb-dd-hdr-email {
          font-family: 'DM Mono', monospace; font-size: 17px;
          color: rgba(255,255,255,0.32); letter-spacing: -0.2px;
        }

        .nb-dd-sec { padding: 8px; }
        .nb-dd-sep { height: 1px; background: rgba(255,255,255,0.06); margin: 3px 0; }

        .nb-dd-item {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 11px; border-radius: 11px;
          font-size: 16px; color: rgba(255, 255, 255, 0.75);
          text-decoration: none; cursor: pointer;
          background: none; border: none; width: 100%; text-align: left;
          transition: all 0.14s;
          font-family: 'Sarabun', sans-serif;
        }
        .nb-dd-item:hover { background: rgba(129,140,248,0.12); color: #fff; }

        .nb-dd-ico {
          width: 28px; height: 28px; border-radius: 8px;
          background: rgba(255,255,255,0.05);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }

        .nb-dd-item.danger { color: #fa3f3f; }
        .nb-dd-item.danger:hover { background: rgba(248,113,113,0.1); color: #fca5a5; }
        .nb-dd-item.danger .nb-dd-ico { background: rgba(248,113,113,0.1); }
        .nb-dd-item:disabled { opacity: 0.45; cursor: not-allowed; }
      `}</style>

      <nav className="nb">
        <div className="nb-inner">

          {/* ── Left ── */}
          <div className="nb-left">
            <button className="nb-burger" onClick={onMenuClick}>
              {isMobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
            <Link href="/dashboard" className="nb-logo">
              <div className="nb-logo-icon">🏃</div>
              <span className="nb-logo-name">RunTrack</span>
            </Link>
          </div>

          {/* ── Right ── */}
          <div className="nb-right">

            {/* Notifications */}
            <div className="nb-notif-wrap" ref={notifRef}>
              <button className="nb-notif-btn" onClick={() => setNotifOpen(!notifOpen)}>
                <Bell size={17} />
                <span className="nb-notif-dot" />
              </button>
              {notifOpen && (
                <div className="nb-drop nb-notif-drop">
                  <div className="nb-notif-head">การแจ้งเตือน</div>
                  <div className="nb-notif-empty">ไม่มีการแจ้งเตือนใหม่</div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="nb-user-wrap" ref={dropdownRef}>
              <button className="nb-user-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <div className="nb-avatar">
                  {user?.avatarUrl
                    ? <img src={user.avatarUrl} alt={user.username} />
                    : initials}
                </div>
                <div className="nb-uinfo">
                  <div className="nb-uname">{user?.name || user?.username}</div>
                  <div className="nb-uemail">{user?.email}</div>
                </div>
                <ChevronDown size={14} className={`nb-chevron${dropdownOpen ? ' open' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="nb-drop nb-user-drop">
                  <div className="nb-dd-hdr">
                    <div className="nb-dd-hdr-name">{user?.name || user?.username}</div>
                    <div className="nb-dd-hdr-email">{user?.email}</div>
                  </div>

                  <div className="nb-dd-sec">
                    <Link href="/profile" className="nb-dd-item" onClick={() => setDropdownOpen(false)}>
                      <span className="nb-dd-ico"><User size={20} /></span>
                      โปรไฟล์
                    </Link>
                    <Link href="/settings" className="nb-dd-item" onClick={() => setDropdownOpen(false)}>
                      <span className="nb-dd-ico"><Settings size={20} /></span>
                      ตั้งค่า
                    </Link>
                  </div>

                  <div className="nb-dd-sep" />

                  <div className="nb-dd-sec">
                    <button
                      className="nb-dd-item danger"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                    >
                      <span className="nb-dd-ico"><LogOut size={14} /></span>
                      {isLoggingOut ? 'กำลังออกจากระบบ...' : 'ออกจากระบบ'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
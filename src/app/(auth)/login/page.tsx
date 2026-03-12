'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '@/lib/store/authStore'
import { Eye, EyeOff, Loader2, AlertCircle, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const login = useAuthStore((state) => state.login)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [formData, setFormData] = useState({ email: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setPasswordError('')
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (response.ok) {
        login(data.user, data.token)
        toast.success('เข้าสู่ระบบสำเร็จ!')
        router.push('/dashboard')
      } else {
        if (response.status === 401 || data.error?.toLowerCase().includes('password') || data.error?.includes('รหัสผ่าน')) {
          setPasswordError('รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง')
          setFormData((prev) => ({ ...prev, password: '' }))
        } else {
          toast.error(data.error || 'เกิดข้อผิดพลาด')
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Sarabun:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .page {
          font-family: 'Sarabun', sans-serif;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #080810;
          position: relative;
          overflow: hidden;
          padding: 16px;
        }

        /* ── Background ── */
        .bg-gradient {
          position: fixed; inset: 0; z-index: 0;
          background:
            radial-gradient(ellipse 80% 60% at 20% -10%, rgba(139,92,246,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 110%, rgba(236,72,153,0.15) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 50% 50%, rgba(109,40,217,0.08) 0%, transparent 70%),
            #080810;
        }
        .orb {
          position: fixed; border-radius: 50%;
          filter: blur(100px); pointer-events: none; z-index: 0;
          animation: floatOrb 12s ease-in-out infinite alternate;
        }
        .orb-a {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(139,92,246,0.2), transparent 70%);
          top: -200px; left: -150px; animation-delay: 0s;
        }
        .orb-b {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(236,72,153,0.18), transparent 70%);
          bottom: -150px; right: -100px; animation-delay: -5s;
        }
        .orb-c {
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(167,139,250,0.12), transparent 70%);
          top: 50%; left: 60%; animation-delay: -8s;
        }
        @keyframes floatOrb {
          from { transform: translate(0,0) scale(1); }
          to   { transform: translate(40px,-50px) scale(1.08); }
        }
        .bg-grid {
          position: fixed; inset: 0; z-index: 0;
          background-image:
            linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px);
          background-size: 56px 56px;
        }

        /* ── Card ── */
        .card {
          position: relative; z-index: 1;
          width: 100%; max-width: 1100px;
          display: grid;
          grid-template-columns: 1fr;
          background: rgba(12,12,22,0.85);
          border: 1px solid rgba(139,92,246,0.15);
          border-radius: 32px;
          overflow: hidden;
          backdrop-filter: blur(24px);
          box-shadow:
            0 0 0 1px rgba(139,92,246,0.08),
            0 32px 80px rgba(0,0,0,0.6),
            0 0 120px rgba(139,92,246,0.08);
        }
        @media (min-width: 768px) {
          .card { grid-template-columns: 1fr 1px 1fr; }
        }

        /* ── Left: branding ── */
        .card-left {
          padding: 72px 64px;
          display: flex; flex-direction: column; justify-content: space-between;
          position: relative; overflow: hidden;
          gap: 56px;
        }
        .card-left::before {
          content: '';
          position: absolute; top: -80px; left: -80px;
          width: 320px; height: 320px;
          background: radial-gradient(circle, rgba(139,92,246,0.15), transparent 65%);
          pointer-events: none;
        }

        .brand {
          display: flex; align-items: center; gap: 16px;
          position: relative; z-index: 1;
        }
        .brand-icon {
          width: 68px; height: 68px; flex-shrink: 0;
          border-radius: 20px;
          background: linear-gradient(135deg, #7c3aed, #ec4899);
          display: flex; align-items: center; justify-content: center;
          font-size: 34px;
          box-shadow: 0 8px 24px rgba(124,58,237,0.45), inset 0 1px 0 rgba(255,255,255,0.15);
        }
        .brand-name {
          font-family: 'Syne', sans-serif;
          font-size: 32px; font-weight: 800;
          color: #fff; letter-spacing: -1px;
        }
        .brand-tagline {
          font-size: 14px; color: rgba(255,255,255,0.35);
          letter-spacing: 0.3px; margin-top: 2px;
        }

        .left-body { position: relative; z-index: 1; }
        .left-heading {
          font-family: 'Syne', sans-serif;
          font-size: clamp(38px, 4vw, 54px);
          font-weight: 800; line-height: 1.08;
          color: #fff; letter-spacing: -1.5px;
          margin-bottom: 20px;
        }
        .left-heading em {
          font-style: normal;
          background: linear-gradient(90deg, #a78bfa, #ec4899, #f9a8d4);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .left-sub {
          font-size: 17px; line-height: 1.75;
          color: rgba(255,255,255,0.42);
          margin-bottom: 44px; max-width: 340px;
        }

        /* Stats */
        .stats {
          display: flex; gap: 0;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(139,92,246,0.12);
          border-radius: 18px; overflow: hidden;
        }
        .stat-item {
          flex: 1; padding: 22px 24px; text-align: center;
          position: relative;
        }
        .stat-item + .stat-item::before {
          content: '';
          position: absolute; left: 0; top: 20%; bottom: 20%;
          width: 1px;
          background: rgba(139,92,246,0.15);
        }
        .stat-num {
          font-family: 'Syne', sans-serif;
          font-size: 26px; font-weight: 800;
          background: linear-gradient(90deg, #a78bfa, #f472b6);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.5px;
        }
        .stat-label {
          font-size: 13px; color: rgba(255,255,255,0.35);
          letter-spacing: 0.5px; text-transform: uppercase;
          margin-top: 4px;
        }

        /* ── Divider ── */
        .card-divider {
          display: none; width: 1px;
          background: linear-gradient(to bottom,
            transparent,
            rgba(139,92,246,0.25) 20%,
            rgba(236,72,153,0.2) 80%,
            transparent);
        }
        @media (min-width: 768px) { .card-divider { display: block; } }

        /* ── Right: form ── */
        .card-right {
          padding: 72px 64px;
          display: flex; flex-direction: column; justify-content: center;
        }

        .form-eyebrow {
          font-size: 12px; font-weight: 600;
          letter-spacing: 2.5px; text-transform: uppercase;
          background: linear-gradient(90deg, #a78bfa, #f472b6);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 12px;
        }
        .form-title {
          font-family: 'Syne', sans-serif;
          font-size: 36px; font-weight: 800;
          color: #fff; letter-spacing: -1px; margin-bottom: 8px;
        }
        .form-sub {
          font-size: 16px; color: rgba(255,255,255,0.38);
          margin-bottom: 40px; line-height: 1.6;
        }

        /* Fields */
        .field { margin-bottom: 22px; }
        .field-label {
          display: block; font-size: 12px; font-weight: 600;
          letter-spacing: 0.8px; text-transform: uppercase;
          color: rgba(255,255,255,0.4); margin-bottom: 10px;
        }
        .field-wrap { position: relative; }
        .field-input {
          width: 100%; height: 58px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 0 20px;
          font-family: 'Sarabun', sans-serif;
          font-size: 17px; color: #fff; outline: none;
          transition: all 0.2s;
        }
        .field-input.pr { padding-right: 44px; }
        .field-input::placeholder { color: rgba(255,255,255,0.18); }
        .field-input:focus {
          border-color: rgba(167,139,250,0.5);
          background: rgba(139,92,246,0.06);
          box-shadow: 0 0 0 3px rgba(139,92,246,0.1);
        }
        .field-input.error {
          border-color: rgba(248,113,113,0.5);
          background: rgba(248,113,113,0.05);
          box-shadow: 0 0 0 3px rgba(248,113,113,0.08);
        }

        .eye-btn {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.25); display: flex; padding: 0;
          transition: color 0.2s;
        }
        .eye-btn:hover { color: rgba(255,255,255,0.65); }

        .error-msg {
          display: flex; align-items: center; gap: 7px;
          margin-top: 8px; font-size: 13px; color: #f87171;
          animation: slideIn 0.2s ease;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Submit */
        .submit-btn {
          width: 100%; height: 58px; margin-top: 28px;
          border: none; border-radius: 16px; cursor: pointer;
          font-family: 'Syne', sans-serif;
          font-size: 17px; font-weight: 700; letter-spacing: 0.3px;
          color: #fff;
          background: linear-gradient(135deg, #7c3aed 0%, #a855f7 40%, #ec4899 100%);
          display: flex; align-items: center; justify-content: center; gap: 10px;
          position: relative; overflow: hidden;
          transition: all 0.25s ease;
          box-shadow: 0 4px 20px rgba(124,58,237,0.35);
        }
        .submit-btn::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, #9333ea 0%, #c026d3 50%, #f43f5e 100%);
          opacity: 0; transition: opacity 0.3s;
        }
        .submit-btn:hover::after { opacity: 1; }
        .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 36px rgba(168,85,247,0.45); }
        .submit-btn:active { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }
        .submit-btn > * { position: relative; z-index: 1; }

        /* Footer */
        .divider { display: flex; align-items: center; gap: 12px; margin: 26px 0; }
        .divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.06); }
        .divider-text { font-size: 13px; color: rgba(255,255,255,0.22); }

        .form-footer { text-align: center; font-size: 15px; color: rgba(255,255,255,0.3); }
        .register-link {
          background: linear-gradient(90deg, #a78bfa, #f472b6);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 600; text-decoration: none;
          border-bottom: 1px solid rgba(167,139,250,0.3);
          padding-bottom: 1px; transition: border-color 0.2s;
        }
        .register-link:hover { border-color: rgba(244,114,182,0.6); }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.7s linear infinite; }
      `}</style>

      <div className="page">
        <div className="bg-gradient" />
        <div className="bg-grid" />
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <div className="orb orb-c" />

        <div className="card">
          {/* ── Left ── */}
          <div className="card-left">
            <div className="brand">
              <div className="brand-icon">🏃</div>
              <div>
                <div className="brand-name">RunTrack</div>
                <div className="brand-tagline">Fitness & Activity Tracker</div>
              </div>
            </div>

            <div className="left-body">
              <h1 className="left-heading">
                ทุกก้าว<br />
                คือ<em>ความก้าวหน้า</em>
              </h1>
              <p className="left-sub">
                ติดตามเส้นทางการวิ่งของคุณ วิเคราะห์สถิติ
                และพัฒนาตัวเองทุกวัน
              </p>

              <div className="stats">
                {[
                  { num: '12K+', label: 'นักวิ่ง' },
                  { num: '4.9★', label: 'คะแนน' },
                  { num: '2M+', label: 'กิโลเมตร' },
                ].map((s) => (
                  <div className="stat-item" key={s.label}>
                    <div className="stat-num">{s.num}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div />
          </div>

          {/* ── Divider ── */}
          <div className="card-divider" />

          {/* ── Right ── */}
          <div className="card-right">
            <p className="form-eyebrow">ยินดีต้อนรับกลับ</p>
            <h2 className="form-title">เข้าสู่ระบบ</h2>
            <p className="form-sub">กรอกข้อมูลเพื่อเริ่มต้นวิ่งวันนี้</p>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label className="field-label" htmlFor="email">อีเมล</label>
                <div className="field-wrap">
                  <input
                    id="email" className="field-input" type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required disabled={loading} autoComplete="email"
                  />
                </div>
              </div>

              <div className="field">
                <label className="field-label" htmlFor="password">รหัสผ่าน</label>
                <div className="field-wrap">
                  <input
                    id="password"
                    className={`field-input pr${passwordError ? ' error' : ''}`}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value })
                      if (passwordError) setPasswordError('')
                    }}
                    required disabled={loading} autoComplete="current-password"
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordError && (
                  <div className="error-msg">
                    <AlertCircle size={14} style={{ flexShrink: 0 }} />
                    <span>{passwordError}</span>
                  </div>
                )}
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading
                  ? <><Loader2 size={17} className="spin" /> กำลังเข้าสู่ระบบ...</>
                  : <>เข้าสู่ระบบ <ArrowRight size={17} /></>}
              </button>
            </form>

            <div className="divider">
              <div className="divider-line" />
              <span className="divider-text">หรือ</span>
              <div className="divider-line" />
            </div>

            <p className="form-footer">
              ยังไม่มีบัญชี?{' '}
              <Link href="/register" className="register-link">สมัครสมาชิกฟรี</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
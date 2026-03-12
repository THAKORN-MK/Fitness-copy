'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff, Loader2, ArrowRight, Check, Zap } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: '', color: '' }
    if (password.length < 6) return { strength: 25, label: 'อ่อนแอ', color: '#ff6b6b' }
    if (password.length < 8) return { strength: 50, label: 'ปานกลาง', color: '#feca57' }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password))
      return { strength: 75, label: 'ดี', color: '#c084fc' }
    return { strength: 100, label: 'แข็งแรง', color: '#f472b6' }
  }

  const passwordStrength = getPasswordStrength(formData.password)
  const passwordsMatch =
    formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      toast.error('รหัสผ่านไม่ตรงกัน')
      return
    }
    setLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      })
      const data = await response.json()
      if (response.ok) {
        toast.success('สมัครสมาชิกสำเร็จ!')
        setTimeout(() => router.push('/login'), 1500)
      } else {
        toast.error(data.error || 'เกิดข้อผิดพลาด')
      }
    } catch (error) {
      console.error('Register error:', error)
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

        /* ── Background layers ── */
        .bg-gradient {
          position: fixed; inset: 0; z-index: 0;
          background:
            radial-gradient(ellipse 80% 60% at 20% -10%, rgba(139,92,246,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 110%, rgba(236,72,153,0.15) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 50% 50%, rgba(109,40,217,0.08) 0%, transparent 70%),
            #080810;
        }

        /* Animated floating orbs */
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
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(40px, -50px) scale(1.08); }
        }

        /* Subtle grid */
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
        }
        /* Inner glow top-left */
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

        .left-mid { position: relative; z-index: 1; }
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
          color: rgba(255,255,255,0.42); max-width: 340px;
          margin-bottom: 44px;
        }

        /* Steps */
        .steps { display: flex; flex-direction: column; gap: 22px; position: relative; z-index: 1; }
        .step { display: flex; align-items: flex-start; gap: 16px; }
        .step-badge {
          width: 40px; height: 40px; flex-shrink: 0;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(124,58,237,0.3), rgba(236,72,153,0.3));
          border: 1px solid rgba(167,139,250,0.2);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif;
          font-size: 15px; font-weight: 700;
          color: #c4b5fd;
        }
        .step-body .step-title {
          font-size: 17px; font-weight: 600;
          color: rgba(255,255,255,0.85); margin-bottom: 4px;
        }
        .step-body .step-desc {
          font-size: 14px; color: rgba(255,255,255,0.35); line-height: 1.5;
        }

        /* Divider */
        .card-divider {
          display: none;
          width: 1px;
          background: linear-gradient(to bottom, transparent, rgba(139,92,246,0.25) 20%, rgba(236,72,153,0.2) 80%, transparent);
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
          color: #fff; letter-spacing: -1px;
          margin-bottom: 8px;
        }
        .form-sub {
          font-size: 16px; color: rgba(255,255,255,0.38);
          margin-bottom: 36px; line-height: 1.6;
        }

        /* Fields */
        .fields-row {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 16px; margin-bottom: 16px;
        }
        .field { margin-bottom: 16px; }
        .field:last-child { margin-bottom: 0; }
        .field-label {
          display: block; font-size: 12px; font-weight: 600;
          letter-spacing: 0.8px; text-transform: uppercase;
          color: rgba(255,255,255,0.4); margin-bottom: 10px;
        }
        .field-wrap { position: relative; }
        .field-input {
          width: 100%; height: 56px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 0 20px;
          font-family: 'Sarabun', sans-serif;
          font-size: 17px; color: #fff; outline: none;
          transition: all 0.2s;
        }
        .field-input.pr { padding-right: 48px; }
        .field-input::placeholder { color: rgba(255,255,255,0.18); }
        .field-input:focus {
          border-color: rgba(167,139,250,0.5);
          background: rgba(139,92,246,0.06);
          box-shadow: 0 0 0 3px rgba(139,92,246,0.1);
        }
        .field-input.matched {
          border-color: rgba(244,114,182,0.5);
          background: rgba(236,72,153,0.05);
          box-shadow: 0 0 0 3px rgba(236,72,153,0.08);
        }

        .eye-btn {
          position: absolute; right: 16px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.25); display: flex; padding: 0;
          transition: color 0.2s;
        }
        .eye-btn:hover { color: rgba(255,255,255,0.65); }

        .match-check {
          position: absolute; right: 16px; top: 50%; transform: translateY(-50%);
          color: #f472b6; display: flex; pointer-events: none;
          animation: popIn 0.25s cubic-bezier(0.175,0.885,0.32,1.275);
        }
        @keyframes popIn {
          from { opacity: 0; transform: translateY(-50%) scale(0.3); }
          to   { opacity: 1; transform: translateY(-50%) scale(1); }
        }

        /* Strength bar */
        .strength-wrap { margin-top: 10px; }
        .strength-track {
          height: 4px; width: 100%;
          background: rgba(255,255,255,0.06);
          border-radius: 99px; overflow: hidden;
        }
        .strength-fill {
          height: 100%; border-radius: 99px;
          transition: width 0.4s ease, background-color 0.4s ease;
        }
        .strength-text {
          margin-top: 6px; font-size: 13px;
          color: rgba(255,255,255,0.3);
          display: flex; align-items: center; gap: 6px;
        }
        .strength-dot { width: 6px; height: 6px; border-radius: 50%; }

        /* Submit */
        .submit-btn {
          width: 100%; height: 58px; margin-top: 24px;
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
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, #9333ea 0%, #c026d3 50%, #f43f5e 100%);
          opacity: 0; transition: opacity 0.3s;
        }
        .submit-btn:hover::after { opacity: 1; }
        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 36px rgba(168,85,247,0.45);
        }
        .submit-btn:active { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }
        .submit-btn > * { position: relative; z-index: 1; }

        /* Bottom */
        .form-footer {
          margin-top: 22px; text-align: center;
          font-size: 15px; color: rgba(255,255,255,0.3);
        }
        .login-link {
          background: linear-gradient(90deg, #a78bfa, #f472b6);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 600; text-decoration: none;
          border-bottom: 1px solid rgba(167,139,250,0.3);
          padding-bottom: 1px;
          transition: border-color 0.2s;
        }
        .login-link:hover { border-color: rgba(244,114,182,0.6); }

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
          {/* ── Left: branding ── */}
          <div className="card-left">
            <div className="brand">
              <div className="brand-icon">🏃</div>
              <div>
                <div className="brand-name">RunTrack</div>
                <div className="brand-tagline">Fitness & Activity Tracker</div>
              </div>
            </div>

            <div className="left-mid">
              <h1 className="left-heading">
                เริ่มต้น<br />
                <em>การเดินทาง</em><br />
                ของคุณ
              </h1>
              <p className="left-sub">
                สร้างบัญชีฟรี แล้วเริ่มติดตาม
                การออกกำลังกายและพัฒนาตัวเองทุกวัน
              </p>

              <div className="steps">
                {[
                  { n: '01', title: 'สร้างบัญชีใน 30 วินาที', desc: 'กรอกข้อมูลเพียงไม่กี่ฟิลด์ก็พร้อม' },
                  { n: '02', title: 'บันทึกการออกกำลังกาย', desc: 'เพิ่มกิจกรรมและแคลอรีได้ทุกวัน' },
                  { n: '03', title: 'วิเคราะห์ความก้าวหน้า', desc: 'ดูกราฟและสถิติพัฒนาการของคุณ' },
                ].map((s) => (
                  <div className="step" key={s.n}>
                    <div className="step-badge">{s.n}</div>
                    <div className="step-body">
                      <div className="step-title">{s.title}</div>
                      <div className="step-desc">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* spacer */}
            <div />
          </div>

          {/* ── Divider ── */}
          <div className="card-divider" />

          {/* ── Right: form ── */}
          <div className="card-right">
            <p className="form-eyebrow">เริ่มต้นใช้งานฟรี</p>
            <h2 className="form-title">สมัครสมาชิก</h2>
            <p className="form-sub">สร้างบัญชีเพื่อเริ่มบันทึกการออกกำลังกาย</p>

            <form onSubmit={handleSubmit}>
              {/* Username + Email side by side */}
              <div className="fields-row">
                <div>
                  <label className="field-label" htmlFor="username">ชื่อผู้ใช้</label>
                  <div className="field-wrap">
                    <input
                      id="username" className="field-input" type="text"
                      placeholder="johndoe"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required disabled={loading} autoComplete="username"
                    />
                  </div>
                </div>
                <div>
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
              </div>

              {/* Password */}
              <div className="field">
                <label className="field-label" htmlFor="password">รหัสผ่าน</label>
                <div className="field-wrap">
                  <input
                    id="password" className="field-input pr"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required disabled={loading} autoComplete="new-password"
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {formData.password && (
                  <div className="strength-wrap">
                    <div className="strength-track">
                      <div className="strength-fill" style={{ width: `${passwordStrength.strength}%`, backgroundColor: passwordStrength.color }} />
                    </div>
                    <div className="strength-text">
                      <div className="strength-dot" style={{ background: passwordStrength.color }} />
                      ความแข็งแรง: {passwordStrength.label}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div className="field">
                <label className="field-label" htmlFor="confirmPassword">ยืนยันรหัสผ่าน</label>
                <div className="field-wrap">
                  <input
                    id="confirmPassword"
                    className={`field-input pr${passwordsMatch ? ' matched' : ''}`}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required disabled={loading} autoComplete="new-password"
                  />
                  {passwordsMatch
                    ? <span className="match-check"><Check size={16} /></span>
                    : (
                      <button type="button" className="eye-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex={-1}>
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    )}
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading
                  ? <><Loader2 size={17} className="spin" /> กำลังสมัคร...</>
                  : <>สมัครสมาชิก <ArrowRight size={17} /></>}
              </button>
            </form>

            <p className="form-footer">
              มีบัญชีแล้ว?{' '}
              <Link href="/login" className="login-link">เข้าสู่ระบบ</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
'use client'

import { useState } from 'react'
import { useAuthStore } from '@/lib/store/authStore'
import { toast } from 'react-hot-toast'
import { Loader2, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react'

export default function ChangePasswordForm() {
  const { token } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState({ current:false, new:false, confirm:false })
  const [form, setForm] = useState({ currentPassword:'', newPassword:'', confirmPassword:'' })

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))
  const toggleShow = (k: keyof typeof show) => setShow(p => ({ ...p, [k]: !p[k] }))

  // password strength
  const strength = (() => {
    const p = form.newPassword
    if (!p) return 0
    let s = 0
    if (p.length >= 8)       s++
    if (/[A-Z]/.test(p))     s++
    if (/[0-9]/.test(p))     s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  })()
  const strengthLabel = ['', 'อ่อน', 'พอใช้', 'ดี', 'แข็งแกร่ง'][strength]
  const strengthColor = ['','#f87171','#fbbf24','#4ade80','#818cf8'][strength]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.newPassword !== form.confirmPassword) { toast.error('รหัสผ่านใหม่ไม่ตรงกัน'); return }
    if (form.newPassword.length < 6) { toast.error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/profile/password', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) { toast.success('เปลี่ยนรหัสผ่านสำเร็จ!'); setForm({ currentPassword:'', newPassword:'', confirmPassword:'' }) }
      else toast.error(data.error || 'เกิดข้อผิดพลาด')
    } catch { toast.error('ไม่สามารถเปลี่ยนรหัสผ่านได้') }
    finally { setLoading(false) }
  }

  const fields = [
    { key:'currentPassword', label:'รหัสผ่านปัจจุบัน', showKey:'current' as const },
    { key:'newPassword',     label:'รหัสผ่านใหม่',      showKey:'new'     as const },
    { key:'confirmPassword', label:'ยืนยันรหัสผ่านใหม่', showKey:'confirm' as const },
  ]

  return (
    <>
      <style>{`
        .cpf{border-radius:20px;padding:22px;
          background:rgba(13,13,26,.82);border:1px solid rgba(255,255,255,.08);backdrop-filter:blur(14px)}
        .cpf-title{font-family:'Syne',sans-serif;font-size:14px;font-weight:800;color:#fff;
          letter-spacing:-.2px;margin-bottom:18px;display:flex;align-items:center;gap:7px}
        .cpf-title-dot{width:6px;height:6px;border-radius:50%;background:linear-gradient(135deg,#22d3ee,#818cf8)}
        .cpf-lbl{font-size:11px;font-weight:600;color:rgba(255,255,255,.45);
          letter-spacing:.06em;text-transform:uppercase;margin-bottom:6px}
        .cpf-field{position:relative;margin-bottom:14px}
        .cpf-ico{position:absolute;left:12px;top:50%;transform:translateY(-50%);
          color:rgba(255,255,255,.3);pointer-events:none}
        .cpf-input{width:100%;padding:11px 40px 11px 38px;border-radius:12px;
          background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.09);
          color:#fff;font-family:'Sarabun',sans-serif;font-size:14px;outline:none;
          transition:border-color .18s;box-sizing:border-box}
        .cpf-input::placeholder{color:rgba(255,255,255,.25)}
        .cpf-input:focus{border-color:rgba(34,211,238,.45);background:rgba(255,255,255,.07)}
        .cpf-input:disabled{opacity:.4}
        .cpf-eye{position:absolute;right:12px;top:50%;transform:translateY(-50%);
          background:none;border:none;cursor:pointer;color:rgba(255,255,255,.35);
          display:flex;align-items:center;padding:0;transition:color .15s;outline:none}
        .cpf-eye:hover{color:rgba(255,255,255,.65)}
        /* strength bar */
        .cpf-str{margin-top:6px;margin-bottom:2px}
        .cpf-str-track{height:4px;border-radius:4px;background:rgba(255,255,255,.08);overflow:hidden}
        .cpf-str-fill{height:100%;border-radius:4px;transition:width .3s,background .3s}
        .cpf-str-lbl{font-size:10px;margin-top:3px;font-weight:600}
        .cpf-submit{width:100%;padding:12px;border-radius:13px;border:none;cursor:pointer;
          font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:#fff;
          background:linear-gradient(135deg,#0e7490,#22d3ee,#818cf8);
          box-shadow:0 4px 20px rgba(34,211,238,.2);transition:all .2s;
          display:flex;align-items:center;justify-content:center;gap:7px;margin-top:18px}
        .cpf-submit:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 7px 26px rgba(34,211,238,.35)}
        .cpf-submit:disabled{opacity:.55;cursor:not-allowed}
      `}</style>
      <div className="cpf">
        <div className="cpf-title"><div className="cpf-title-dot"/><ShieldCheck size={14} style={{ color:'#22d3ee' }}/>เปลี่ยนรหัสผ่าน</div>
        <form onSubmit={handleSubmit}>
          {fields.map(({ key, label, showKey }) => (
            <div key={key}>
              <div className="cpf-lbl">{label}</div>
              <div className="cpf-field">
                <Lock size={14} className="cpf-ico"/>
                <input
                  className="cpf-input"
                  type={show[showKey] ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form[key as keyof typeof form]}
                  onChange={e => set(key, e.target.value)}
                  disabled={loading}
                  required
                />
                <button type="button" className="cpf-eye" onClick={() => toggleShow(showKey)}>
                  {show[showKey] ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
              {/* strength indicator for new password */}
              {key === 'newPassword' && form.newPassword && (
                <div className="cpf-str">
                  <div className="cpf-str-track">
                    <div className="cpf-str-fill" style={{ width:`${strength * 25}%`, background: strengthColor }}/>
                  </div>
                  <div className="cpf-str-lbl" style={{ color: strengthColor }}>{strengthLabel}</div>
                </div>
              )}
            </div>
          ))}
          <button type="submit" className="cpf-submit" disabled={loading}>
            {loading
              ? <><Loader2 size={14} style={{ animation:'spin 1s linear infinite' }}/> กำลังเปลี่ยน...</>
              : <><ShieldCheck size={14}/> เปลี่ยนรหัสผ่าน</>}
          </button>
        </form>
      </div>
    </>
  )
}
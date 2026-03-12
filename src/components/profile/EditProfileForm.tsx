'use client'

import { useState, useRef } from 'react'
import { useAuthStore } from '@/lib/store/authStore'
import { toast } from 'react-hot-toast'
import { Loader2, Save, User, Mail, AtSign, Lock } from 'lucide-react'

interface EditProfileFormProps { user: any; onUpdate: () => void }

export default function EditProfileForm({ user, onUpdate }: EditProfileFormProps) {
  const { token, updateUser } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' })

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) { toast.success('อัปเดตโปรไฟล์สำเร็จ!'); updateUser(data.user); onUpdate() }
      else toast.error(data.error || 'เกิดข้อผิดพลาด')
    } catch { toast.error('ไม่สามารถอัปเดตได้') }
    finally { setLoading(false) }
  }

  return (
    <>
      <style>{`
        .epf{border-radius:20px;padding:22px;
          background:rgba(13,13,26,.82);border:1px solid rgba(255,255,255,.08);backdrop-filter:blur(14px)}
        .epf-title{font-family:'Syne',sans-serif;font-size:14px;font-weight:800;color:#fff;
          letter-spacing:-.2px;margin-bottom:18px;display:flex;align-items:center;gap:7px}
        .epf-title-dot{width:6px;height:6px;border-radius:50%;background:linear-gradient(135deg,#818cf8,#ec4899)}
        .epf-lbl{font-size:11px;font-weight:600;color:rgba(255,255,255,.45);
          letter-spacing:.06em;text-transform:uppercase;margin-bottom:6px}
        .epf-field{position:relative;margin-bottom:14px}
        .epf-field:last-of-type{margin-bottom:0}
        .epf-field-ico{position:absolute;left:12px;top:50%;transform:translateY(-50%);
          color:rgba(255,255,255,.3);pointer-events:none}
        .epf-input{width:100%;padding:11px 14px 11px 38px;border-radius:12px;
          background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.09);
          color:#fff;font-family:'Sarabun',sans-serif;font-size:14px;outline:none;
          transition:border-color .18s;box-sizing:border-box}
        .epf-input::placeholder{color:rgba(255,255,255,.25)}
        .epf-input:focus{border-color:rgba(129,140,248,.55);background:rgba(255,255,255,.07)}
        .epf-input:disabled{opacity:.4;cursor:not-allowed}
        .epf-hint{font-size:11px;color:rgba(255,255,255,.3);margin-top:4px;display:flex;align-items:center;gap:4px}
        .epf-submit{width:100%;padding:12px;border-radius:13px;border:none;cursor:pointer;
          font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:#fff;
          background:linear-gradient(135deg,#5b21b6,#7c3aed,#a21caf);
          box-shadow:0 4px 20px rgba(91,33,182,.35);transition:all .2s;
          display:flex;align-items:center;justify-content:center;gap:7px;margin-top:18px}
        .epf-submit:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 7px 26px rgba(124,58,237,.5)}
        .epf-submit:disabled{opacity:.55;cursor:not-allowed}
      `}</style>
      <div className="epf">
        <div className="epf-title"><div className="epf-title-dot"/>แก้ไขโปรไฟล์</div>
        <form onSubmit={handleSubmit}>
          <div className="epf-lbl">ชื่อ-นามสกุล</div>
          <div className="epf-field">
            <User size={14} className="epf-field-ico"/>
            <input className="epf-input" placeholder="ชื่อ-นามสกุล"
              value={form.name} onChange={e => set('name', e.target.value)} disabled={loading}/>
          </div>
          <div className="epf-lbl">อีเมล</div>
          <div className="epf-field">
            <Mail size={14} className="epf-field-ico"/>
            <input className="epf-input" type="email" placeholder="email@example.com"
              value={form.email} onChange={e => set('email', e.target.value)} disabled={loading}/>
          </div>
          <div className="epf-lbl">ชื่อผู้ใช้</div>
          <div className="epf-field">
            <AtSign size={14} className="epf-field-ico"/>
            <input className="epf-input" value={user?.username || ''} disabled/>
          </div>
          <div className="epf-hint"><Lock size={9}/> ชื่อผู้ใช้ไม่สามารถเปลี่ยนแปลงได้</div>
          <button type="submit" className="epf-submit" disabled={loading}>
            {loading
              ? <><Loader2 size={14} style={{ animation:'spin 1s linear infinite' }}/> กำลังบันทึก...</>
              : <><Save size={14}/> บันทึกการเปลี่ยนแปลง</>}
          </button>
        </form>
      </div>
    </>
  )
}
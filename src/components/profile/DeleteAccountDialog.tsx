'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/authStore'
import { toast } from 'react-hot-toast'
import { Loader2, AlertTriangle, X, Trash2 } from 'lucide-react'

interface DeleteAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function DeleteAccountDialog({ open, onOpenChange }: DeleteAccountDialogProps) {
  const router = useRouter()
  const { token, logout } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmText, setConfirmText] = useState('')

  const canDelete = confirmText === 'DELETE' && password.length > 0

  const handleDelete = async () => {
    if (!canDelete) return
    setLoading(true)
    try {
      const res = await fetch('/api/profile/delete', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body: JSON.stringify({ password, confirmText }),
      })
      const data = await res.json()
      if (res.ok) { toast.success('ลบบัญชีสำเร็จ'); logout(); router.push('/login') }
      else toast.error(data.error || 'เกิดข้อผิดพลาด')
    } catch { toast.error('ไม่สามารถลบบัญชีได้') }
    finally { setLoading(false) }
  }

  if (!open) return null

  return (
    <>
      <style>{`
        .dad-overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);
          backdrop-filter:blur(8px);z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px}
        .dad{width:100%;max-width:420px;border-radius:22px;
          background:rgba(13,13,26,.97);border:1px solid rgba(248,113,113,.2);
          padding:28px;position:relative;animation:dad-in .22s ease}
        @keyframes dad-in{from{opacity:0;transform:scale(.95) translateY(8px)}to{opacity:1;transform:none}}
        .dad-close{position:absolute;top:16px;right:16px;width:28px;height:28px;border-radius:8px;
          background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);
          display:flex;align-items:center;justify-content:center;cursor:pointer;
          color:rgba(255,255,255,.5);outline:none;transition:all .15s}
        .dad-close:hover{background:rgba(255,255,255,.12);color:#fff}
        .dad-ico{width:48px;height:48px;border-radius:14px;
          background:rgba(248,113,113,.12);border:1px solid rgba(248,113,113,.25);
          display:flex;align-items:center;justify-content:center;margin-bottom:14px}
        .dad-title{font-family:'Syne',sans-serif;font-size:17px;font-weight:800;
          color:#f87171;letter-spacing:-.4px;margin-bottom:6px}
        .dad-sub{font-size:13px;color:rgba(255,255,255,.55);line-height:1.6;margin-bottom:16px}
        .dad-list{border-radius:12px;padding:12px 14px;
          background:rgba(248,113,113,.06);border:1px solid rgba(248,113,113,.15);
          margin-bottom:18px}
        .dad-list-item{font-size:12px;color:rgba(248,113,113,.8);
          display:flex;align-items:center;gap:7px;padding:3px 0}
        .dad-list-dot{width:4px;height:4px;border-radius:50%;background:#f87171;flex-shrink:0}
        .dad-lbl{font-size:11px;font-weight:600;color:rgba(255,255,255,.4);
          letter-spacing:.06em;text-transform:uppercase;margin-bottom:6px}
        .dad-input{width:100%;padding:11px 14px;border-radius:12px;
          background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.09);
          color:#fff;font-family:'Sarabun',sans-serif;font-size:14px;outline:none;
          transition:border-color .18s;box-sizing:border-box;margin-bottom:12px}
        .dad-input::placeholder{color:rgba(255,255,255,.25)}
        .dad-input:focus{border-color:rgba(248,113,113,.5)}
        .dad-input.ok{border-color:rgba(248,113,113,.6)}
        .dad-btns{display:flex;gap:8px;margin-top:4px}
        .dad-cancel{flex:1;padding:11px;border-radius:12px;border:1px solid rgba(255,255,255,.12);
          background:rgba(255,255,255,.05);color:rgba(255,255,255,.65);cursor:pointer;
          font-family:'Syne',sans-serif;font-size:13px;font-weight:700;outline:none;transition:all .16s}
        .dad-cancel:hover{background:rgba(255,255,255,.1);color:#fff}
        .dad-del{flex:1;padding:11px;border-radius:12px;border:none;cursor:pointer;
          font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:#fff;
          background:linear-gradient(135deg,#991b1b,#ef4444);
          box-shadow:0 4px 18px rgba(239,68,68,.3);outline:none;transition:all .16s;
          display:flex;align-items:center;justify-content:center;gap:6px}
        .dad-del:hover:not(:disabled){box-shadow:0 6px 24px rgba(239,68,68,.5)}
        .dad-del:disabled{opacity:.35;cursor:not-allowed}
      `}</style>
      <div className="dad-overlay" onClick={e => { if (e.target === e.currentTarget) onOpenChange(false) }}>
        <div className="dad">
          <button className="dad-close" onClick={() => onOpenChange(false)}><X size={14}/></button>
          <div className="dad-ico"><AlertTriangle size={22} style={{ color:'#f87171' }}/></div>
          <div className="dad-title">ลบบัญชีถาวร</div>
          <div className="dad-sub">
            การกระทำนี้<strong style={{ color:'#fff' }}>ไม่สามารถย้อนกลับได้</strong><br/>
            ข้อมูลทั้งหมดจะถูกลบอย่างถาวร
          </div>
          <div className="dad-list">
            {['ข้อมูลโปรไฟล์ทั้งหมด','การออกกำลังกายทั้งหมด','สถิติและประวัติ','เป้าหมายทั้งหมด'].map(t => (
              <div className="dad-list-item" key={t}><div className="dad-list-dot"/>{t}</div>
            ))}
          </div>
          <div className="dad-lbl">ยืนยันด้วยรหัสผ่าน</div>
          <input
            className="dad-input" type="password" placeholder="กรอกรหัสผ่าน"
            value={password} onChange={e => setPassword(e.target.value)} disabled={loading}
          />
          <div className="dad-lbl">
            พิมพ์ <span style={{ fontFamily:'monospace', color:'#f87171', fontWeight:700 }}>DELETE</span> เพื่อยืนยัน
          </div>
          <input
            className={`dad-input ${confirmText === 'DELETE' ? 'ok' : ''}`}
            placeholder="DELETE"
            value={confirmText} onChange={e => setConfirmText(e.target.value)} disabled={loading}
          />
          <div className="dad-btns">
            <button className="dad-cancel" onClick={() => onOpenChange(false)} disabled={loading}>ยกเลิก</button>
            <button className="dad-del" onClick={handleDelete} disabled={!canDelete || loading}>
              {loading
                ? <><Loader2 size={14} style={{ animation:'spin 1s linear infinite' }}/> กำลังลบ...</>
                : <><Trash2 size={14}/> ลบบัญชีถาวร</>}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
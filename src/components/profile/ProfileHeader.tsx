'use client'

import { useState, useRef } from 'react'
import { Camera, Calendar, Activity, Flame, Clock, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { useAuthStore } from '@/lib/store/authStore'
import { toast } from 'react-hot-toast'

interface ProfileHeaderProps {
  user: any
  onUpdate?: () => void
}

export default function ProfileHeader({ user, onUpdate }: ProfileHeaderProps) {
  const { token, updateUser } = useAuthStore()
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const initial = (user?.name || user?.username || '?').charAt(0).toUpperCase()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('ไฟล์ต้องมีขนาดไม่เกิน 5MB'); return }
    if (!file.type.startsWith('image/')) { toast.error('กรุณาเลือกไฟล์รูปภาพ'); return }

    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/profile/avatar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })
      const data = await res.json()
      if (res.ok) {
        updateUser({ ...user, avatarUrl: data.avatarUrl })
        toast.success('อัปโหลดรูปโปรไฟล์สำเร็จ!')
        onUpdate?.()
      } else {
        toast.error(data.error || 'เกิดข้อผิดพลาด')
      }
    } catch { toast.error('ไม่สามารถอัปโหลดได้') }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = '' }
  }

  const stats = [
    { icon: Activity, color: '#818cf8', val: user?.totalWorkouts ?? 0,                          label: 'ครั้ง' },
    { icon: Flame,    color: '#f472b6', val: Math.round(user?.totalCalories ?? 0).toLocaleString(), label: 'cal' },
    { icon: Clock,    color: '#22d3ee', val: Math.floor((user?.totalDuration ?? 0) / 60),       label: 'ชม.' },
  ]

  return (
    <>
      <style>{`
        .ph{border-radius:24px;overflow:hidden;position:relative;
          background:rgba(13,13,26,.85);border:1px solid rgba(255,255,255,.08);backdrop-filter:blur(16px)}
        .ph-banner{height:110px;
          background:linear-gradient(135deg,#3b0764 0%,#5b21b6 30%,#7c3aed 60%,#a21caf 85%,#be185d 100%);
          position:relative}
        .ph-banner::after{content:'';position:absolute;inset:0;
          background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Ccircle cx='30' cy='30' r='20'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          pointer-events:none}
        .ph-body{padding:0 24px 24px;display:flex;align-items:flex-end;justify-content:space-between;
          flex-wrap:wrap;gap:16px}
        .ph-avatar-wrap{position:relative;margin-top:-44px;flex-shrink:0}
        .ph-avatar{width:88px;height:88px;border-radius:50%;
          border:3px solid rgba(13,13,26,1);background:rgba(129,140,248,.2);
          display:flex;align-items:center;justify-content:center;overflow:hidden;
          font-family:'Syne',sans-serif;font-size:32px;font-weight:800;color:#fff}
        .ph-avatar img{width:100%;height:100%;object-fit:cover}
        .ph-cam-btn{position:absolute;bottom:2px;right:2px;width:26px;height:26px;border-radius:50%;
          background:linear-gradient(135deg,#7c3aed,#a21caf);border:2px solid rgba(13,13,26,1);
          display:flex;align-items:center;justify-content:center;cursor:pointer;
          transition:transform .18s;outline:none}
        .ph-cam-btn:hover{transform:scale(1.12)}
        .ph-info{flex:1;min-width:0;padding-top:12px}
        .ph-name{font-family:'Syne',sans-serif;font-size:clamp(18px,2.5vw,24px);font-weight:800;
          color:#fff;letter-spacing:-.6px;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .ph-uname{font-size:13px;color:rgba(255,255,255,.5);margin-bottom:6px}
        .ph-since{display:inline-flex;align-items:center;gap:5px;
          font-size:11px;color:rgba(255,255,255,.4)}
        .ph-stats{display:flex;gap:6px;flex-wrap:wrap;padding-top:12px}
        .ph-stat{display:flex;align-items:center;gap:7px;padding:10px 14px;border-radius:13px;
          background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07)}
        .ph-stat-ico{width:28px;height:28px;border-radius:8px;
          display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .ph-stat-num{font-family:'DM Mono',monospace;font-size:16px;font-weight:500;
          color:#fff;letter-spacing:-.5px;line-height:1}
        .ph-stat-lbl{font-size:10px;color:rgba(255,255,255,.4);margin-top:1px;font-family:'Sarabun',sans-serif}
      `}</style>

      <div className="ph">
        <div className="ph-banner"/>
        <div className="ph-body">
          <div style={{ display:'flex', alignItems:'flex-end', gap:14, flexWrap:'wrap' }}>
            <div className="ph-avatar-wrap">
              <div className="ph-avatar">
                {user?.avatarUrl
                  ? <img src={user.avatarUrl} alt={user.username}/>
                  : initial}
              </div>
              <button
                className="ph-cam-btn"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                title="เปลี่ยนรูปโปรไฟล์"
              >
                {uploading
                  ? <Loader2 size={12} color="#fff" style={{ animation:'spin 1s linear infinite' }}/>
                  : <Camera size={12} color="#fff"/>}
              </button>
              <input
                ref={fileRef} type="file" accept="image/*"
                style={{ display:'none' }} onChange={handleFileChange}
              />
            </div>
            <div className="ph-info">
              <div className="ph-name">{user?.name || user?.username}</div>
              <div className="ph-uname">@{user?.username}</div>
              <div className="ph-since">
                <Calendar size={11}/>
                เข้าร่วม {user?.createdAt ? format(new Date(user.createdAt), 'MMM yyyy', { locale: th }) : '—'}
              </div>
            </div>
          </div>
          <div className="ph-stats">
            {stats.map(({ icon: Icon, color, val, label }) => (
              <div className="ph-stat" key={label}>
                <div className="ph-stat-ico" style={{ background:`${color}18`, border:`1px solid ${color}30` }}>
                  <Icon size={13} style={{ color }}/>
                </div>
                <div>
                  <div className="ph-stat-num">{val}</div>
                  <div className="ph-stat-lbl">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
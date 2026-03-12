'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store/authStore'
import { toast } from 'react-hot-toast'
import { Loader2, Trash2, Activity, Flame, Clock, Route } from 'lucide-react'
import ProfileHeader from '@/components/profile/ProfileHeader'
import EditProfileForm from '@/components/profile/EditProfileForm'
import ChangePasswordForm from '@/components/profile/ChangePasswordForm'
import DeleteAccountDialog from '@/components/profile/DeleteAccountDialog'

export default function ProfilePage() {
  const { token } = useAuthStore()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showDelete, setShowDelete] = useState(false)

  useEffect(() => { fetchProfile() }, [])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) { const d = await res.json(); setUser(d.user) }
      else toast.error('ไม่สามารถโหลดโปรไฟล์ได้')
    } catch { toast.error('เกิดข้อผิดพลาด') }
    finally { setLoading(false) }
  }

  const statCards = [
    { icon: Activity, color:'#818cf8', val: user?.totalWorkouts ?? 0,                                  unit:'ครั้ง', label:'ออกกำลังกาย' },
    { icon: Flame,    color:'#f472b6', val: Math.round(user?.totalCalories ?? 0).toLocaleString(),     unit:'cal',   label:'แคลอรี่' },
    { icon: Clock,    color:'#22d3ee', val: Math.floor((user?.totalDuration ?? 0) / 60),               unit:'ชม.',   label:'เวลา' },
    { icon: Route,    color:'#4ade80', val: Number(user?.totalDistance ?? 0).toFixed(1),               unit:'km',    label:'ระยะทาง' },
  ]

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:400 }}>
      <Loader2 size={32} style={{ color:'#818cf8', animation:'spin 1s linear infinite' }}/>
    </div>
  )

  if (!user) return (
    <div style={{ textAlign:'center', padding:'48px 0', color:'rgba(255,255,255,.5)', fontFamily:'Sarabun,sans-serif' }}>
      ไม่พบข้อมูลโปรไฟล์
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@700;800&family=Sarabun:wght@400;500;600&display=swap');
        .pp{font-family:'Sarabun',sans-serif;color:#fff;display:flex;flex-direction:column;gap:16px}
        .pp-hd-title{font-family:'Syne',sans-serif;font-size:clamp(20px,2.5vw,26px);font-weight:800;
          letter-spacing:-.6px;margin-bottom:4px}
        .pp-hd-sub{font-size:13px;color:rgba(255,255,255,.5)}
        /* stat grid */
        .pp-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
        @media(max-width:580px){.pp-stats{grid-template-columns:1fr 1fr}}
        .pp-stat{border-radius:18px;padding:16px 18px;position:relative;overflow:hidden;
          background:rgba(13,13,26,.8);border:1px solid rgba(255,255,255,.07);backdrop-filter:blur(12px)}
        .pp-stat::after{content:'';position:absolute;bottom:-18px;right:-18px;width:70px;height:70px;
          border-radius:50%;filter:blur(22px);opacity:.45;pointer-events:none}
        .pp-stat-lbl{font-size:11px;color:rgba(255,255,255,.45);letter-spacing:.05em;text-transform:uppercase;margin-bottom:8px}
        .pp-stat-val{font-family:'DM Mono',monospace;font-size:26px;font-weight:500;letter-spacing:-1px;line-height:1;color:#fff}
        .pp-stat-unit{font-size:12px;color:rgba(255,255,255,.4);margin-left:4px;font-family:'Sarabun',sans-serif}
        /* 2-col */
        .pp-2col{display:grid;grid-template-columns:1fr 1fr;gap:14px}
        @media(max-width:640px){.pp-2col{grid-template-columns:1fr}}
        /* danger zone */
        .pp-danger{border-radius:20px;padding:20px;
          background:rgba(13,13,26,.82);border:1px solid rgba(248,113,113,.18);backdrop-filter:blur(14px)}
        .pp-danger-title{font-family:'Syne',sans-serif;font-size:14px;font-weight:800;
          color:#f87171;margin-bottom:4px;display:flex;align-items:center;gap:6px}
        .pp-danger-sub{font-size:12px;color:rgba(255,255,255,.4);margin-bottom:14px}
        .pp-danger-row{display:flex;align-items:center;justify-content:space-between;gap:12px;
          padding:14px;border-radius:13px;background:rgba(248,113,113,.06);border:1px solid rgba(248,113,113,.12)}
        .pp-danger-del-btn{display:inline-flex;align-items:center;gap:6px;
          padding:9px 16px;border-radius:10px;border:none;cursor:pointer;flex-shrink:0;
          font-family:'Syne',sans-serif;font-size:12px;font-weight:700;color:#fff;
          background:linear-gradient(135deg,#991b1b,#ef4444);
          box-shadow:0 3px 14px rgba(239,68,68,.3);transition:all .18s}
        .pp-danger-del-btn:hover{box-shadow:0 5px 20px rgba(239,68,68,.5)}
      `}</style>

      <div className="pp">
        {/* Header */}
        <div>
          <div className="pp-hd-title">👤 โปรไฟล์</div>
          <div className="pp-hd-sub">จัดการข้อมูลส่วนตัวและการตั้งค่าบัญชี</div>
        </div>

        {/* Profile banner + avatar */}
        <ProfileHeader user={user} onUpdate={fetchProfile}/>

        {/* Stat cards */}
        <div className="pp-stats">
          {statCards.map(({ icon: Icon, color, val, unit, label }) => (
            <div className="pp-stat" key={label} style={{ '--gc': color } as any}>
              <style>{`.pp-stat:nth-child(${statCards.indexOf({icon:Icon,color,val,unit,label})+1})::after{background:${color}}`}</style>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                <div style={{ width:28, height:28, borderRadius:8, background:`${color}18`,
                  border:`1px solid ${color}30`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Icon size={13} style={{ color }}/>
                </div>
                <div className="pp-stat-lbl" style={{ marginBottom:0 }}>{label}</div>
              </div>
              <div>
                <span className="pp-stat-val">{val}</span>
                <span className="pp-stat-unit">{unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 2-col forms */}
        <div className="pp-2col">
          <EditProfileForm user={user} onUpdate={fetchProfile}/>
          <ChangePasswordForm/>
        </div>

        {/* Danger Zone */}
        <div className="pp-danger">
          <div className="pp-danger-title"><Trash2 size={13}/> Danger Zone</div>
          <div className="pp-danger-sub">การกระทำเหล่านี้ไม่สามารถย้อนกลับได้</div>
          <div className="pp-danger-row">
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:'#fca5a5', marginBottom:3 }}>ลบบัญชี</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,.45)' }}>ลบบัญชีและข้อมูลทั้งหมดอย่างถาวร</div>
            </div>
            <button className="pp-danger-del-btn" onClick={() => setShowDelete(true)}>
              <Trash2 size={13}/> ลบบัญชี
            </button>
          </div>
        </div>
      </div>

      <DeleteAccountDialog open={showDelete} onOpenChange={setShowDelete}/>
    </>
  )
}
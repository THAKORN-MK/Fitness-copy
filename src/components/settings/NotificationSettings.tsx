'use client'

import { Bell, Mail, Target, BarChart2 } from 'lucide-react'

interface NotificationSettingsProps {
  notifications: { email: boolean; push: boolean; goalReminders: boolean; weeklyReport: boolean }
  onNotificationChange: (key: string, value: boolean) => void
}

const items = [
  { key:'email',        icon:Mail,     color:'#818cf8', label:'แจ้งเตือนทางอีเมล',   desc:'รับการแจ้งเตือนสำคัญทางอีเมล',            disabled:false },
  { key:'push',         icon:Bell,     color:'#a78bfa', label:'Push Notifications',   desc:'รับการแจ้งเตือนแบบ Push (เร็วๆ นี้)',      disabled:true  },
  { key:'goalReminders',icon:Target,   color:'#4ade80', label:'แจ้งเตือนเป้าหมาย',   desc:'เตือนความคืบหน้าและเป้าหมายใกล้หมดเวลา', disabled:false },
  { key:'weeklyReport', icon:BarChart2,color:'#f59e0b', label:'รายงานประจำสัปดาห์',  desc:'รับสรุปสถิติทุกวันอาทิตย์',               disabled:false },
]

export default function NotificationSettings({ notifications, onNotificationChange }: NotificationSettingsProps) {
  return (
    <>
      <style>{`
        .ns{border-radius:20px;padding:20px;
          background:rgba(13,13,26,.82);border:1px solid rgba(255,255,255,.08);backdrop-filter:blur(14px)}
        .ns-title{font-family:'Syne',sans-serif;font-size:14px;font-weight:800;color:#fff;
          letter-spacing:-.2px;margin-bottom:6px;display:flex;align-items:center;gap:7px}
        .ns-title-dot{width:6px;height:6px;border-radius:50%;background:linear-gradient(135deg,#818cf8,#f59e0b)}
        .ns-sub{font-size:12px;color:rgba(255,255,255,.45);margin-bottom:14px}
        .ns-row{display:flex;align-items:center;justify-content:space-between;gap:12px;
          padding:12px 14px;border-radius:13px;border:1px solid rgba(255,255,255,.07);
          background:rgba(255,255,255,.03);margin-bottom:8px;transition:border-color .18s}
        .ns-row:last-child{margin-bottom:0}
        .ns-row:hover:not(.disabled){border-color:rgba(255,255,255,.12)}
        .ns-row.disabled{opacity:.45}
        .ns-ico{width:34px;height:34px;border-radius:9px;flex-shrink:0;
          display:flex;align-items:center;justify-content:center}
        .ns-lbl{font-size:13px;font-weight:600;color:#fff;margin-bottom:2px}
        .ns-desc{font-size:11px;color:rgba(255,255,255,.4)}
        /* custom toggle */
        .ns-toggle{position:relative;width:42px;height:24px;flex-shrink:0;cursor:pointer}
        .ns-toggle input{opacity:0;width:0;height:0;position:absolute}
        .ns-slider{position:absolute;inset:0;border-radius:24px;
          background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.12);
          transition:all .22s}
        .ns-slider::before{content:'';position:absolute;width:18px;height:18px;border-radius:50%;
          background:#fff;left:2px;top:2px;transition:transform .22s,background .22s;
          box-shadow:0 1px 4px rgba(0,0,0,.4)}
        .ns-toggle input:checked + .ns-slider{background:rgba(129,140,248,.4);border-color:rgba(129,140,248,.6)}
        .ns-toggle input:checked + .ns-slider::before{transform:translateX(18px);background:#818cf8}
      `}</style>
      <div className="ns">
        <div className="ns-title"><div className="ns-title-dot"/>การแจ้งเตือน</div>
        <div className="ns-sub">จัดการการรับการแจ้งเตือนต่างๆ</div>
        {items.map(({ key, icon: Icon, color, label, desc, disabled }) => (
          <div key={key} className={`ns-row ${disabled ? 'disabled' : ''}`}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div className="ns-ico" style={{ background:`${color}18`, border:`1px solid ${color}30` }}>
                <Icon size={15} style={{ color }}/>
              </div>
              <div>
                <div className="ns-lbl">{label}{disabled && <span style={{ fontSize:10, marginLeft:6, color:'rgba(255,255,255,.35)', fontWeight:400 }}>เร็วๆ นี้</span>}</div>
                <div className="ns-desc">{desc}</div>
              </div>
            </div>
            <label className="ns-toggle">
              <input
                type="checkbox"
                checked={notifications[key as keyof typeof notifications]}
                disabled={disabled}
                onChange={e => !disabled && onNotificationChange(key, e.target.checked)}
              />
              <span className="ns-slider"/>
            </label>
          </div>
        ))}
      </div>
    </>
  )
}
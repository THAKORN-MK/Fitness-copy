'use client'

import { User, Mail, Calendar, Shield, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import Link from 'next/link'

interface AccountInfoProps { user: any }

export default function AccountInfo({ user }: AccountInfoProps) {
  const rows = [
    { icon: User,     color: '#818cf8', label: 'ชื่อผู้ใช้',       val: user?.username },
    { icon: Mail,     color: '#f472b6', label: 'อีเมล',             val: user?.email },
    { icon: Calendar, color: '#22d3ee', label: 'สมัครสมาชิกเมื่อ', val: user?.createdAt ? format(new Date(user.createdAt), 'PPP', { locale: th }) : '—' },
    { icon: Shield,   color: '#4ade80', label: 'สถานะบัญชี',       val: 'ใช้งานปกติ', valColor: '#4ade80' },
  ]

  return (
    <>
      <style>{`
        .ai{border-radius:20px;padding:20px;
          background:rgba(13,13,26,.82);border:1px solid rgba(255,255,255,.08);backdrop-filter:blur(14px)}
        .ai-title{font-family:'Syne',sans-serif;font-size:14px;font-weight:800;color:#fff;
          letter-spacing:-.2px;margin-bottom:14px;display:flex;align-items:center;gap:7px}
        .ai-title-dot{width:6px;height:6px;border-radius:50%;background:linear-gradient(135deg,#818cf8,#ec4899)}
        .ai-row{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;
          background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);margin-bottom:7px}
        .ai-row:last-of-type{margin-bottom:0}
        .ai-ico{width:32px;height:32px;border-radius:9px;flex-shrink:0;
          display:flex;align-items:center;justify-content:center}
        .ai-lbl{font-size:11px;color:rgba(255,255,255,.4);letter-spacing:.04em;text-transform:uppercase;margin-bottom:2px}
        .ai-val{font-size:13px;font-weight:600;color:#fff;word-break:break-all}
        .ai-link{display:flex;align-items:center;justify-content:center;gap:7px;width:100%;
          padding:10px;border-radius:12px;border:1px solid rgba(129,140,248,.25);
          background:rgba(129,140,248,.08);font-family:'Syne',sans-serif;font-size:13px;
          font-weight:700;color:#a78bfa;text-decoration:none;transition:all .18s;margin-top:12px}
        .ai-link:hover{background:rgba(129,140,248,.18);border-color:rgba(129,140,248,.4);color:#c4b5fd}
      `}</style>
      <div className="ai">
        <div className="ai-title"><div className="ai-title-dot"/>ข้อมูลบัญชี</div>
        {rows.map(({ icon: Icon, color, label, val, valColor }: any) => (
          <div className="ai-row" key={label}>
            <div className="ai-ico" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
              <Icon size={14} style={{ color }}/>
            </div>
            <div>
              <div className="ai-lbl">{label}</div>
              <div className="ai-val" style={valColor ? { color: valColor } : {}}>{val}</div>
            </div>
          </div>
        ))}
        <Link href="/profile" className="ai-link">
          แก้ไขข้อมูลส่วนตัว <ExternalLink size={12}/>
        </Link>
      </div>
    </>
  )
}
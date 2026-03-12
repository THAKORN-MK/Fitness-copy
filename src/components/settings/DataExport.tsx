'use client'

import { useState } from 'react'
import { useAuthStore } from '@/lib/store/authStore'
import { toast } from 'react-hot-toast'
import { Download, FileJson, FileSpreadsheet, Loader2, AlertTriangle } from 'lucide-react'

export default function DataExport() {
  const { token } = useAuthStore()
  const [loading, setLoading] = useState<string | null>(null)

  const handleExport = async (fmt: 'json' | 'csv') => {
    setLoading(fmt)
    try {
      const res = await fetch(`/api/export?format=${fmt}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const blob = await res.blob()
        const url  = window.URL.createObjectURL(blob)
        const a    = document.createElement('a')
        a.href = url; a.download = `fitness-data.${fmt}`
        document.body.appendChild(a); a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        toast.success(`ดาวน์โหลด ${fmt.toUpperCase()} สำเร็จ!`)
      } else { toast.error('ไม่สามารถดาวน์โหลดข้อมูลได้') }
    } catch { toast.error('เกิดข้อผิดพลาด') }
    finally  { setLoading(null) }
  }

  const cards = [
    { fmt: 'json' as const, Icon: FileJson,        color: '#818cf8', label: 'JSON',
      desc: 'ข้อมูลสมบูรณ์ รวมทุก field' },
    { fmt: 'csv'  as const, Icon: FileSpreadsheet, color: '#4ade80', label: 'CSV',
      desc: 'เปิดใน Excel / Google Sheets' },
  ]

  return (
    <>
      <style>{`
        .de{border-radius:20px;padding:20px;
          background:rgba(13,13,26,.82);border:1px solid rgba(255,255,255,.08);backdrop-filter:blur(14px)}
        .de-title{font-family:'Syne',sans-serif;font-size:14px;font-weight:800;color:#fff;
          letter-spacing:-.2px;margin-bottom:6px;display:flex;align-items:center;gap:7px}
        .de-title-dot{width:6px;height:6px;border-radius:50%;background:linear-gradient(135deg,#4ade80,#22d3ee)}
        .de-sub{font-size:12px;color:rgba(255,255,255,.45);margin-bottom:16px}
        .de-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}
        .de-card{border-radius:14px;padding:14px;border:1px solid rgba(255,255,255,.08);
          background:rgba(255,255,255,.03);display:flex;flex-direction:column;gap:10px}
        .de-card-head{display:flex;align-items:center;gap:8px}
        .de-card-ico{width:34px;height:34px;border-radius:9px;
          display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .de-card-name{font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:#fff}
        .de-card-desc{font-size:11px;color:rgba(255,255,255,.4)}
        .de-btn{display:flex;align-items:center;justify-content:center;gap:6px;
          padding:8px 12px;border-radius:10px;border:none;cursor:pointer;
          font-family:'Syne',sans-serif;font-size:12px;font-weight:700;color:#fff;
          transition:all .18s;width:100%}
        .de-btn:disabled{opacity:.5;cursor:not-allowed}
        .de-warn{display:flex;align-items:flex-start;gap:8px;padding:11px 13px;
          border-radius:12px;background:rgba(251,191,36,.08);border:1px solid rgba(251,191,36,.2)}
        .de-warn-txt{font-size:12px;color:rgba(251,191,36,.9);line-height:1.5}
      `}</style>
      <div className="de">
        <div className="de-title"><div className="de-title-dot"/>ส่งออกข้อมูล</div>
        <div className="de-sub">ดาวน์โหลดข้อมูลทั้งหมดของคุณ</div>

        <div className="de-grid">
          {cards.map(({ fmt, Icon, color, label, desc }) => (
            <div className="de-card" key={fmt}>
              <div className="de-card-head">
                <div className="de-card-ico" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                  <Icon size={16} style={{ color }}/>
                </div>
                <div>
                  <div className="de-card-name">{label}</div>
                  <div className="de-card-desc">{desc}</div>
                </div>
              </div>
              <button
                className="de-btn"
                style={{ background: `linear-gradient(135deg,${color}55,${color}33)`, border: `1px solid ${color}40` }}
                onClick={() => handleExport(fmt)}
                disabled={loading !== null}
              >
                {loading === fmt
                  ? <><Loader2 size={12} style={{ animation:'spin 1s linear infinite' }}/> กำลังดาวน์โหลด...</>
                  : <><Download size={12}/> ดาวน์โหลด {label}</>}
              </button>
            </div>
          ))}
        </div>

        <div className="de-warn">
          <AlertTriangle size={14} style={{ color:'#fbbf24', flexShrink:0, marginTop:1 }}/>
          <div className="de-warn-txt">ข้อมูลที่ส่งออกรวม: โปรไฟล์, การออกกำลังกายทั้งหมด, และเป้าหมายทั้งหมด</div>
        </div>
      </div>
    </>
  )
}
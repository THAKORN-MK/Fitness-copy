'use client'

import { Sun, Moon, Monitor, Check } from 'lucide-react'

interface ThemeSettingsProps {
  theme: string
  onThemeChange: (theme: string) => void
}

const themes = [
  { value:'dark',   icon:Moon,    color:'#818cf8', label:'Dark',   desc:'ธีมมืด',            available:true  },
  { value:'system', icon:Monitor, color:'#22d3ee', label:'System', desc:'ตามการตั้งค่าระบบ', available:false },
  { value:'light',  icon:Sun,     color:'#fbbf24', label:'Light',  desc:'ธีมสว่าง',          available:false },
]

export default function ThemeSettings({ theme, onThemeChange }: ThemeSettingsProps) {
  return (
    <>
      <style>{`
        .ts{border-radius:20px;padding:20px;
          background:rgba(13,13,26,.82);border:1px solid rgba(255,255,255,.08);backdrop-filter:blur(14px)}
        .ts-title{font-family:'Syne',sans-serif;font-size:14px;font-weight:800;color:#fff;
          letter-spacing:-.2px;margin-bottom:6px;display:flex;align-items:center;gap:7px}
        .ts-title-dot{width:6px;height:6px;border-radius:50%;background:linear-gradient(135deg,#818cf8,#f472b6)}
        .ts-sub{font-size:12px;color:rgba(255,255,255,.45);margin-bottom:16px}
        .ts-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
        @media(max-width:400px){.ts-grid{grid-template-columns:1fr}}
        .ts-opt{border-radius:14px;padding:14px 12px;border:1.5px solid rgba(255,255,255,.08);
          background:rgba(255,255,255,.03);cursor:pointer;position:relative;
          display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;
          transition:all .18s;outline:none}
        .ts-opt:hover:not(.unavailable){border-color:rgba(255,255,255,.18);background:rgba(255,255,255,.06)}
        .ts-opt.sel{border-color:var(--tc);background:rgba(var(--tcr),.1)}
        .ts-opt.unavailable{opacity:.45;cursor:not-allowed}
        .ts-ico{width:38px;height:38px;border-radius:11px;
          display:flex;align-items:center;justify-content:center}
        .ts-name{font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:#fff}
        .ts-desc{font-size:11px;color:rgba(255,255,255,.4)}
        .ts-check{position:absolute;top:8px;right:8px;width:18px;height:18px;border-radius:50%;
          background:var(--tc,#818cf8);display:flex;align-items:center;justify-content:center}
        .ts-badge{font-size:9px;font-weight:700;padding:2px 6px;border-radius:5px;
          background:rgba(255,255,255,.1);color:rgba(255,255,255,.4);letter-spacing:.05em}
        .ts-note{margin-top:12px;padding:10px 13px;border-radius:12px;
          background:rgba(129,140,248,.08);border:1px solid rgba(129,140,248,.18);
          font-size:12px;color:rgba(165,180,252,.85)}
      `}</style>
      <div className="ts">
        <div className="ts-title"><div className="ts-title-dot"/>ธีม</div>
        <div className="ts-sub">เลือกธีมที่คุณต้องการใช้งาน</div>
        <div className="ts-grid">
          {themes.map(({ value, icon: Icon, color, label, desc, available }) => {
            const sel = theme === value
            return (
              <button
                key={value}
                className={`ts-opt ${sel ? 'sel' : ''} ${!available ? 'unavailable' : ''}`}
                style={sel ? { '--tc': color } as any : {}}
                onClick={() => available && onThemeChange(value)}
                type="button"
              >
                {sel && <div className="ts-check" style={{ '--tc': color } as any}><Check size={10} color="#fff"/></div>}
                <div className="ts-ico" style={{ background:`${color}18`, border:`1px solid ${color}30` }}>
                  <Icon size={17} style={{ color }}/>
                </div>
                <div>
                  <div className="ts-name">{label}</div>
                  <div className="ts-desc">{desc}</div>
                </div>
                {!available && <span className="ts-badge">เร็วๆ นี้</span>}
              </button>
            )
          })}
        </div>
        <div className="ts-note">
          💡 ธีมสว่างและธีมตามระบบจะเปิดใช้งานในเวอร์ชันถัดไป
        </div>
      </div>
    </>
  )
}
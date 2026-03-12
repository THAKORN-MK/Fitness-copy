'use client'

import { useState } from 'react'
import { useAuthStore } from '@/lib/store/authStore'
import { toast } from 'react-hot-toast'
import { Loader2, Plus, Activity, Flame, Clock, Route, Calendar } from 'lucide-react'

interface CreateGoalFormProps {
  onSuccess: () => void
}

const targetTypes = [
  { value: 'workouts', label: 'จำนวนครั้ง',    unit: 'ครั้ง', icon: '🏃', color: '#818cf8' },
  { value: 'calories', label: 'แคลอรี่',        unit: 'cal',  icon: '🔥', color: '#f472b6' },
  { value: 'duration', label: 'เวลา',           unit: 'นาที', icon: '⏱️', color: '#22d3ee' },
  { value: 'distance', label: 'ระยะทาง',        unit: 'km',   icon: '📍', color: '#4ade80' },
]

function todayStr() {
  return new Date().toISOString().split('T')[0]
}
function addDaysStr(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export default function CreateGoalForm({ onSuccess }: CreateGoalFormProps) {
  const { token } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    targetType: '',
    targetValue: '',
    startDate: todayStr(),
    endDate: addDaysStr(7),
  })

  const selectedType = targetTypes.find(t => t.value === form.targetType)

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.targetType) { toast.error('กรุณาเลือกประเภทเป้าหมาย'); return }
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      toast.error('วันเสร็จสิ้นต้องหลังวันเริ่มต้น'); return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: form.title,
          description: form.description || null,
          targetType: form.targetType,
          targetValue: parseFloat(form.targetValue),
          startDate: form.startDate,
          endDate: form.endDate,
        })
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('สร้างเป้าหมายสำเร็จ! 🎯')
        setForm({ title: '', description: '', targetType: '', targetValue: '', startDate: todayStr(), endDate: addDaysStr(7) })
        onSuccess()
      } else {
        toast.error(data.error || 'เกิดข้อผิดพลาด')
      }
    } catch {
      toast.error('ไม่สามารถสร้างเป้าหมายได้')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        .cgf{border-radius:22px;padding:28px;
          background:rgba(13,13,26,.85);border:1px solid rgba(129,140,248,.2);
          backdrop-filter:blur(16px);position:relative;overflow:hidden}
        .cgf::before{content:'';position:absolute;top:-60px;right:-60px;width:200px;height:200px;
          border-radius:50%;background:radial-gradient(circle,rgba(129,140,248,.12),transparent 70%);pointer-events:none}

        .cgf-title{font-family:'Syne',sans-serif;font-size:17px;font-weight:800;color:#fff;
          letter-spacing:-.4px;margin-bottom:22px;display:flex;align-items:center;gap:8px}
        .cgf-title-ico{width:32px;height:32px;border-radius:9px;
          background:linear-gradient(135deg,rgba(129,140,248,.25),rgba(168,85,247,.2));
          border:1px solid rgba(129,140,248,.3);display:flex;align-items:center;justify-content:center;font-size:16px}

        .cgf-lbl{font-size:12px;font-weight:600;color:rgba(255,255,255,.55);
          letter-spacing:.06em;text-transform:uppercase;margin-bottom:7px}

        /* text inputs */
        .cgf-input{width:100%;padding:11px 14px;border-radius:12px;
          background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.1);
          color:#fff;font-family:'Sarabun',sans-serif;font-size:14px;outline:none;
          transition:border-color .18s;box-sizing:border-box}
        .cgf-input::placeholder{color:rgba(255,255,255,.3)}
        .cgf-input:focus{border-color:rgba(129,140,248,.6);background:rgba(255,255,255,.07)}
        textarea.cgf-input{resize:vertical;min-height:72px}

        /* target type options */
        .cgf-types{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
        @media(max-width:500px){.cgf-types{grid-template-columns:1fr 1fr}}
        .cgf-type-btn{padding:12px 8px;border-radius:13px;border:1.5px solid rgba(255,255,255,.08);
          background:rgba(255,255,255,.03);cursor:pointer;text-align:center;transition:all .18s;outline:none}
        .cgf-type-btn:hover{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.15)}
        .cgf-type-btn.sel{border-color:var(--tc);background:rgba(var(--tcr),.12)}
        .cgf-type-ico{font-size:20px;margin-bottom:5px}
        .cgf-type-name{font-size:12px;font-weight:600;color:rgba(255,255,255,.65)}
        .cgf-type-btn.sel .cgf-type-name{color:#fff}
        .cgf-type-unit{font-size:10px;color:rgba(255,255,255,.35);margin-top:2px}

        /* value input with unit badge */
        .cgf-val-wrap{display:flex;gap:8px;align-items:stretch}
        .cgf-unit-badge{padding:11px 14px;border-radius:12px;
          background:rgba(255,255,255,.07);border:1.5px solid rgba(255,255,255,.1);
          font-size:12px;font-weight:700;color:rgba(255,255,255,.5);
          white-space:nowrap;display:flex;align-items:center}

        /* date row */
        .cgf-date-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        @media(max-width:400px){.cgf-date-row{grid-template-columns:1fr}}
        .cgf-date-wrap{position:relative}
        .cgf-date-ico{position:absolute;left:11px;top:50%;transform:translateY(-50%);
          color:rgba(129,140,248,.7);pointer-events:none}
        .cgf-input.date{padding-left:36px;cursor:pointer;color-scheme:dark}

        /* submit */
        .cgf-submit{width:100%;padding:13px;border-radius:14px;border:none;cursor:pointer;
          font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:#fff;
          background:linear-gradient(135deg,#5b21b6,#7c3aed,#a21caf);
          box-shadow:0 4px 22px rgba(91,33,182,.4);transition:all .2s;
          display:flex;align-items:center;justify-content:center;gap:8px}
        .cgf-submit:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 28px rgba(124,58,237,.55)}
        .cgf-submit:disabled{opacity:.6;cursor:not-allowed}

        .cgf-section{margin-bottom:18px}
        .cgf-row2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        @media(max-width:480px){.cgf-row2{grid-template-columns:1fr}}
      `}</style>

      <div className="cgf">
        <div className="cgf-title">
          <div className="cgf-title-ico">🎯</div>
          สร้างเป้าหมายใหม่
        </div>

        <form onSubmit={handleSubmit}>
          {/* Title + Description */}
          <div className="cgf-section">
            <div className="cgf-lbl">ชื่อเป้าหมาย *</div>
            <input
              className="cgf-input"
              placeholder="เช่น ออกกำลังกาย 5 ครั้งต่อสัปดาห์"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="cgf-section">
            <div className="cgf-lbl">รายละเอียด</div>
            <textarea
              className="cgf-input"
              placeholder="เพิ่มรายละเอียด (ไม่บังคับ)"
              value={form.description}
              onChange={e => set('description', e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Target Type */}
          <div className="cgf-section">
            <div className="cgf-lbl">ประเภทเป้าหมาย *</div>
            <div className="cgf-types">
              {targetTypes.map(t => {
                // compute hex to rgb approx for css var
                const isSelected = form.targetType === t.value
                return (
                  <button
                    key={t.value}
                    type="button"
                    className={`cgf-type-btn ${isSelected ? 'sel' : ''}`}
                    style={isSelected ? { '--tc': t.color, borderColor: t.color } as any : {}}
                    onClick={() => set('targetType', t.value)}
                    disabled={loading}
                  >
                    <div className="cgf-type-ico">{t.icon}</div>
                    <div className="cgf-type-name" style={isSelected ? { color: t.color } : {}}>{t.label}</div>
                    <div className="cgf-type-unit">{t.unit}</div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Target Value */}
          <div className="cgf-section">
            <div className="cgf-lbl">ค่าเป้าหมาย *</div>
            <div className="cgf-val-wrap">
              <input
                className="cgf-input"
                style={{ flex: 1 }}
                type="number"
                min="1"
                step="any"
                placeholder="เช่น 5"
                value={form.targetValue}
                onChange={e => set('targetValue', e.target.value)}
                required
                disabled={loading}
              />
              <div className="cgf-unit-badge">
                {selectedType?.unit ?? '—'}
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div className="cgf-section">
            <div className="cgf-lbl">ช่วงเวลา *</div>
            <div className="cgf-date-row">
              <div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,.4)', marginBottom:5 }}>วันเริ่มต้น</div>
                <div className="cgf-date-wrap">
                  <Calendar size={14} className="cgf-date-ico"/>
                  <input
                    className="cgf-input date"
                    type="date"
                    value={form.startDate}
                    onChange={e => set('startDate', e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,.4)', marginBottom:5 }}>วันเสร็จสิ้น</div>
                <div className="cgf-date-wrap">
                  <Calendar size={14} className="cgf-date-ico"/>
                  <input
                    className="cgf-input date"
                    type="date"
                    value={form.endDate}
                    min={form.startDate}
                    onChange={e => set('endDate', e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>

          <button type="submit" className="cgf-submit" disabled={loading}>
            {loading
              ? <><Loader2 size={15} style={{ animation:'spin 1s linear infinite' }}/> กำลังสร้าง...</>
              : <><Plus size={15}/> สร้างเป้าหมาย</>}
          </button>
        </form>
      </div>
    </>
  )
}
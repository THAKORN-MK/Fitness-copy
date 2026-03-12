'use client'

import { useState } from 'react'
import { differenceInDays, format } from 'date-fns'
import { th } from 'date-fns/locale'
import { Trash2, CheckCircle2, XCircle, Clock, Activity, Flame, Route, Target, Calendar, AlertTriangle } from 'lucide-react'
import { useAuthStore } from '@/lib/store/authStore'
import { toast } from 'react-hot-toast'

interface GoalCardProps {
  goal: any
  onDelete: () => void
}

const typeConfig: Record<string, { icon: string; color: string; label: string; unit: string }> = {
  workouts: { icon: '🏃', color: '#818cf8', label: 'ครั้ง',  unit: 'ครั้ง' },
  calories: { icon: '🔥', color: '#f472b6', label: 'cal',    unit: 'cal'   },
  duration: { icon: '⏱️', color: '#22d3ee', label: 'นาที',   unit: 'นาที'  },
  distance: { icon: '📍', color: '#4ade80', label: 'km',     unit: 'km'    },
}

export default function GoalCard({ goal, onDelete }: GoalCardProps) {
  const { token } = useAuthStore()
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const cfg     = typeConfig[goal.targetType] ?? { icon: '🎯', color: '#a78bfa', label: '', unit: '' }
  const current = Number(goal.currentValue ?? 0)
  const target  = Number(goal.targetValue ?? 1)
  const pct     = Math.min(100, (current / target) * 100)

  const now      = new Date()
  const endDate  = new Date(goal.endDate)
  const daysLeft = differenceInDays(endDate, now)
  const isOver   = now > endDate

  // auto-resolve status display
  const status: 'completed' | 'failed' | 'active' =
    goal.status === 'completed' ? 'completed'
    : goal.status === 'failed'  ? 'failed'
    : isOver && pct < 100       ? 'failed'   // expired without hitting target
    : pct >= 100                ? 'completed'
    : 'active'

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/goals/${goal.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) { toast.success('ลบเป้าหมายสำเร็จ'); onDelete() }
      else toast.error('ไม่สามารถลบได้')
    } catch { toast.error('เกิดข้อผิดพลาด') }
    finally { setDeleting(false); setShowConfirm(false) }
  }

  return (
    <>
      <style>{`
        .gc{border-radius:20px;padding:20px;position:relative;overflow:hidden;
          background:rgba(13,13,26,.82);backdrop-filter:blur(14px);
          border:1.5px solid rgba(255,255,255,.08);
          transition:transform .2s,border-color .2s}
        .gc:hover{transform:translateY(-3px)}
        .gc.completed{border-color:rgba(74,222,128,.3)}
        .gc.failed{border-color:rgba(248,113,113,.25)}
        .gc.active{border-color:rgba(251,191,36,.2)}

        /* glow blob */
        .gc-blob{position:absolute;bottom:-30px;right:-30px;width:110px;height:110px;
          border-radius:50%;filter:blur(32px);opacity:.4;pointer-events:none}
        .gc.completed .gc-blob{background:#4ade80}
        .gc.failed    .gc-blob{background:#f87171}
        .gc.active    .gc-blob{background:#818cf8}

        /* status badge */
        .gc-badge{display:inline-flex;align-items:center;gap:5px;
          padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;
          font-family:'Syne',sans-serif;letter-spacing:.04em}
        .gc-badge.completed{background:rgba(74,222,128,.15);color:#4ade80;border:1px solid rgba(74,222,128,.3)}
        .gc-badge.failed   {background:rgba(248,113,113,.15);color:#f87171;border:1px solid rgba(248,113,113,.3)}
        .gc-badge.active   {background:rgba(251,191,36,.12);color:#fbbf24;border:1px solid rgba(251,191,36,.25)}

        /* type chip */
        .gc-type{width:38px;height:38px;border-radius:11px;
          display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}

        /* title */
        .gc-title{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;color:#fff;
          letter-spacing:-.3px;line-height:1.3;margin-bottom:3px}
        .gc-desc{font-size:12px;color:rgba(255,255,255,.45);line-height:1.4}

        /* progress track */
        .gc-track{height:7px;border-radius:10px;background:rgba(255,255,255,.08);overflow:hidden;margin:12px 0 6px}
        .gc-fill{height:100%;border-radius:10px;transition:width .6s ease}

        /* meta row */
        .gc-meta{display:flex;align-items:center;justify-content:space-between;
          font-size:12px;color:rgba(255,255,255,.45)}
        .gc-meta-pct{font-family:'DM Mono',monospace;font-size:12px;font-weight:500}

        /* values */
        .gc-vals{display:flex;align-items:baseline;gap:4px;margin:10px 0 2px}
        .gc-cur{font-family:'DM Mono',monospace;font-size:28px;font-weight:500;letter-spacing:-1px;line-height:1}
        .gc-sep{font-size:14px;color:rgba(255,255,255,.3)}
        .gc-tgt{font-family:'DM Mono',monospace;font-size:16px;color:rgba(255,255,255,.4);letter-spacing:-.5px}
        .gc-unit{font-size:12px;color:rgba(255,255,255,.4);margin-left:4px;font-family:'Sarabun',sans-serif}

        /* date */
        .gc-dates{display:flex;align-items:center;gap:5px;font-size:11px;color:rgba(255,255,255,.4);margin-top:10px}
        .gc-dates-dot{width:3px;height:3px;border-radius:50%;background:rgba(255,255,255,.25)}

        /* delete */
        .gc-del{position:absolute;top:14px;right:14px;width:30px;height:30px;border-radius:8px;
          border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);cursor:pointer;
          display:flex;align-items:center;justify-content:center;color:rgba(255,100,100,.5);
          transition:all .18s;outline:none}
        .gc-del:hover{background:rgba(248,113,113,.15);border-color:rgba(248,113,113,.3);color:#f87171}

        /* confirm overlay */
        .gc-confirm{position:absolute;inset:0;border-radius:20px;
          background:rgba(8,8,18,.92);backdrop-filter:blur(8px);
          display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;
          padding:20px;z-index:10}
        .gc-confirm-ttl{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:#fff;text-align:center}
        .gc-confirm-sub{font-size:12px;color:rgba(255,255,255,.5);text-align:center}
        .gc-confirm-row{display:flex;gap:8px;margin-top:4px}
        .gc-confirm-cancel{padding:8px 16px;border-radius:10px;border:1px solid rgba(255,255,255,.15);
          background:rgba(255,255,255,.06);color:rgba(255,255,255,.7);cursor:pointer;
          font-family:'Syne',sans-serif;font-size:12px;font-weight:700;outline:none;transition:all .16s}
        .gc-confirm-cancel:hover{background:rgba(255,255,255,.12)}
        .gc-confirm-ok{padding:8px 16px;border-radius:10px;border:none;
          background:linear-gradient(135deg,#dc2626,#ef4444);color:#fff;cursor:pointer;
          font-family:'Syne',sans-serif;font-size:12px;font-weight:700;outline:none;transition:all .16s}
        .gc-confirm-ok:hover{opacity:.85}
        .gc-confirm-ok:disabled{opacity:.5;cursor:not-allowed}
      `}</style>

      <div className={`gc ${status}`} style={{ fontFamily: "'Sarabun', sans-serif" }}>
        <div className="gc-blob"/>

        {/* Delete button */}
        <button className="gc-del" onClick={() => setShowConfirm(true)} disabled={deleting}>
          <Trash2 size={13}/>
        </button>

        {/* Confirm overlay */}
        {showConfirm && (
          <div className="gc-confirm">
            <AlertTriangle size={22} style={{ color: '#f87171' }}/>
            <div className="gc-confirm-ttl">ลบเป้าหมายนี้?</div>
            <div className="gc-confirm-sub">"{goal.title}"<br/>ไม่สามารถย้อนกลับได้</div>
            <div className="gc-confirm-row">
              <button className="gc-confirm-cancel" onClick={() => setShowConfirm(false)}>ยกเลิก</button>
              <button className="gc-confirm-ok" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'กำลังลบ...' : 'ลบเลย'}
              </button>
            </div>
          </div>
        )}

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
          <div className="gc-type" style={{ background: `${cfg.color}22`, border: `1px solid ${cfg.color}44` }}>
            {cfg.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="gc-title">{goal.title}</div>
            {goal.description && <div className="gc-desc">{goal.description}</div>}
          </div>
        </div>

        {/* Status badge */}
        <div style={{ marginBottom: 8 }}>
          <span className={`gc-badge ${status}`}>
            {status === 'completed' && <><CheckCircle2 size={11}/> สำเร็จแล้ว! 🎉</>}
            {status === 'failed'    && <><XCircle size={11}/> ไม่สำเร็จ</>}
            {status === 'active'    && <><Clock size={11}/> กำลังดำเนินการ</>}
          </span>
        </div>

        {/* Values */}
        <div className="gc-vals">
          <span className="gc-cur" style={{ color: cfg.color }}>{current.toLocaleString()}</span>
          <span className="gc-sep">/</span>
          <span className="gc-tgt">{target.toLocaleString()}</span>
          <span className="gc-unit">{cfg.unit}</span>
        </div>

        {/* Progress bar */}
        <div className="gc-track">
          <div
            className="gc-fill"
            style={{
              width: `${pct}%`,
              background: status === 'completed'
                ? 'linear-gradient(90deg,#4ade80,#22d3ee)'
                : status === 'failed'
                ? 'linear-gradient(90deg,#f87171,#fb923c)'
                : `linear-gradient(90deg,${cfg.color},#a855f7)`
            }}
          />
        </div>

        <div className="gc-meta">
          <span className="gc-meta-pct" style={{
            color: status === 'completed' ? '#4ade80' : status === 'failed' ? '#f87171' : cfg.color
          }}>
            {pct.toFixed(0)}%
          </span>
          {status === 'active' && (
            <span>
              {daysLeft > 0 ? `เหลือ ${daysLeft} วัน` : daysLeft === 0 ? 'วันสุดท้าย!' : 'หมดเวลา'}
            </span>
          )}
        </div>

        {/* Date range */}
        <div className="gc-dates">
          <Calendar size={10}/>
          <span>{format(new Date(goal.startDate), 'd MMM yyyy', { locale: th })}</span>
          <div className="gc-dates-dot"/>
          <span>{format(new Date(goal.endDate), 'd MMM yyyy', { locale: th })}</span>
        </div>
      </div>
    </>
  )
}
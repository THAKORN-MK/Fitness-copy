'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { Edit, Trash2, Clock, Flame, Route, ImageIcon, AlertTriangle, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '@/lib/store/authStore'

interface WorkoutCardProps {
  workout: any
  onDelete: () => void
}

const TYPE_ICON: Record<string, string> = {
  'วิ่ง':'🏃','ปั่นจักรยาน':'🚴','ว่ายน้ำ':'🏊','เดิน':'🚶','วิ่งเทรล':'🏔️',
  'กระโดดเชือก':'⚡','ยิม':'🏋️','โยคะ':'🧘','เอโรบิก':'💃','มวย':'🥊',
  'บาสเก็ตบอล':'🏀','ฟุตบอล':'⚽','เทนนิส':'🎾','แบดมินตัน':'🏸','อื่นๆ':'✨',
}

const TYPE_GLOW: Record<string, string> = {
  'วิ่ง':        'rgba(35,55,233,0.58)',
  'วิ่งเทรล':   'rgba(129,140,248,0.28)',
  'ปั่นจักรยาน':'rgba(251,191,36,0.22)',
  'ว่ายน้ำ':    'rgba(34,211,238,0.24)',
  'เดิน':       'rgba(74,222,128,0.22)',
  'กระโดดเชือก':'rgba(250,204,21,0.24)',
  'ยิม':        'rgba(168,85,247,0.26)',
  'โยคะ':       'rgba(244,114,182,0.24)',
  'เอโรบิก':   'rgba(230,32,131,0.49)',
  'มวย':        'rgba(248,113,113,0.28)',
  'บาสเก็ตบอล':'rgba(251,146,60,0.24)',
  'ฟุตบอล':    'rgba(10,252,98,0.24)',
  'เทนนิส':    'rgba(251,191,36,0.22)',
  'แบดมินตัน': 'rgba(129,140,248,0.22)',
  'อื่นๆ':     'rgba(167,139,250,0.22)',
}

/**
 * ปัญหา: database เก็บเวลาเป็น local time (Asia/Bangkok)
 * แต่ new Date("2025-03-13T08:00:00") → JS ถือว่าเป็น UTC → แสดงเป็น 15:00 (+7)
 *
 * แก้: ตัด timezone suffix ออกก่อน แล้ว parse ใหม่เป็น local time
 * "2025-03-13T08:00:00.000Z"  → ตัด Z ออก → "2025-03-13T08:00:00.000" → local 08:00 ✓
 * "2025-03-13T08:00:00+07:00" → ตัด +07:00 ออก → local 08:00 ✓
 * "2025-03-13T08:00:00"       → ไม่มี suffix อยู่แล้ว → local 08:00 ✓
 */
function toLocalDate(raw: string): Date {
  const s = raw
    .replace('Z', '')                      // ตัด UTC marker
    .replace(/[+-]\d{2}:\d{2}$/, '')       // ตัด offset เช่น +07:00
    .replace(' ', 'T')                     // รองรับ "2025-03-13 08:00:00"
  return new Date(s)
}

export default function WorkoutCard({ workout, onDelete }: WorkoutCardProps) {
  const router = useRouter()
  const { token } = useAuthStore()
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting, setDeleting]       = useState(false)
  const [imgOpen, setImgOpen]         = useState(false)

  const icon        = TYPE_ICON[workout.exerciseType] ?? '✨'
  const glow        = TYPE_GLOW[workout.exerciseType] ?? 'rgba(129,140,248,0.22)'
  const workoutDate = toLocalDate(workout.exerciseDate)   // ← ใช้ตัวนี้แทน new Date()

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/workouts/${workout.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) { toast.success('ลบสำเร็จ'); onDelete() }
      else toast.error('ไม่สามารถลบได้')
    } catch { toast.error('เกิดข้อผิดพลาด') }
    finally { setDeleting(false); setShowConfirm(false) }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@700;800&family=Sarabun:wght@400;500;600&display=swap');

        .wc{border-radius:20px;overflow:hidden;position:relative;
          background:rgba(13,13,26,.88);border:1px solid rgba(255,255,255,.09);
          backdrop-filter:blur(16px);
          transition:transform .2s,border-color .2s,box-shadow .2s}
        .wc:hover{transform:translateY(-3px);border-color:rgba(255,255,255,.16);
          box-shadow:0 8px 32px rgba(0,0,0,.4)}
        .wc-img{width:100%;height:150px;object-fit:cover;display:block;cursor:pointer;transition:opacity .2s}
        .wc-img:hover{opacity:.88}
        .wc-body{padding:16px;position:relative;z-index:1}
        .wc-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:12px}
        .wc-type-row{display:flex;align-items:center;gap:9px}
        .wc-ico{width:38px;height:38px;border-radius:11px;
          background:rgba(129,140,248,.13);border:1px solid rgba(129,140,248,.22);
          display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
        .wc-name{font-family:'Syne',sans-serif;font-size:16px;font-weight:800;color:#fff;letter-spacing:-.4px}
        .wc-date{font-size:12px;color:rgba(255,255,255,.42);margin-top:2px}
        .wc-actions{display:flex;gap:5px;flex-shrink:0}
        .wc-btn{width:30px;height:30px;border-radius:8px;border:1px solid rgba(255,255,255,.08);
          background:rgba(255,255,255,.04);cursor:pointer;
          display:flex;align-items:center;justify-content:center;transition:all .16s;outline:none}
        .wc-btn.edit:hover{background:rgba(129,140,248,.2);border-color:rgba(129,140,248,.4);color:#818cf8}
        .wc-btn.del:hover{background:rgba(248,113,113,.15);border-color:rgba(248,113,113,.35);color:#f87171}
        .wc-stats{display:flex;gap:7px;flex-wrap:wrap}
        .wc-stat{display:flex;align-items:center;gap:5px;padding:7px 11px;border-radius:10px;
          background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.09)}
        .wc-stat-val{font-family:'DM Mono',monospace;font-size:14px;font-weight:500;color:#fff;letter-spacing:-.4px}
        .wc-stat-unit{font-size:11px;color:rgba(255,255,255,.45)}
        .wc-notes{margin-top:11px;font-size:12px;color:rgba(255,255,255,.45);
          font-style:italic;line-height:1.55;
          display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
        .wc-confirm{position:absolute;inset:0;border-radius:20px;
          background:rgba(5,5,15,.93);backdrop-filter:blur(10px);
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          gap:10px;padding:20px;z-index:20}
        .wc-confirm-ttl{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:#fff}
        .wc-confirm-row{display:flex;gap:8px}
        .wc-confirm-cancel{padding:8px 16px;border-radius:10px;border:1px solid rgba(255,255,255,.15);
          background:rgba(255,255,255,.06);color:rgba(255,255,255,.7);cursor:pointer;
          font-family:'Syne',sans-serif;font-size:12px;font-weight:700;outline:none}
        .wc-confirm-ok{padding:8px 16px;border-radius:10px;border:none;
          background:linear-gradient(135deg,#991b1b,#ef4444);color:#fff;cursor:pointer;
          font-family:'Syne',sans-serif;font-size:12px;font-weight:700;outline:none}
        .wc-confirm-ok:disabled{opacity:.5;cursor:not-allowed}
        .wc-lb{position:fixed;inset:0;background:rgba(0,0,0,.9);z-index:1000;
          display:flex;align-items:center;justify-content:center;padding:16px;cursor:zoom-out}
        .wc-lb img{max-width:100%;max-height:90vh;border-radius:14px;object-fit:contain}
        .wc-lb-close{position:absolute;top:16px;right:16px;width:36px;height:36px;border-radius:10px;
          background:rgba(255,255,255,.12);border:none;cursor:pointer;
          display:flex;align-items:center;justify-content:center;color:#fff}
      `}</style>

      <div className="wc">
        {/* glow blob */}
        <div style={{
          position:'absolute', bottom:-40, right:-40,
          width:160, height:160, borderRadius:'50%',
          background:`radial-gradient(circle, ${glow} 0%, transparent 70%)`,
          filter:'blur(28px)', pointerEvents:'none', zIndex:0,
        }}/>

        {workout.imageUrl && (
          <img className="wc-img" src={workout.imageUrl} alt={workout.exerciseType}
            onClick={() => setImgOpen(true)}/>
        )}

        <div className="wc-body">
          <div className="wc-top">
            <div className="wc-type-row">
              <div className="wc-ico">{icon}</div>
              <div>
                <div className="wc-name">{workout.exerciseType}</div>
                {/* ใช้ workoutDate (local) แทน new Date(workout.exerciseDate) */}
                <div className="wc-date">
                  {format(workoutDate, 'd MMM yyyy · HH:mm', { locale: th })}
                </div>
              </div>
            </div>
            <div className="wc-actions">
              <button className="wc-btn edit" style={{ color:'rgba(255,255,255,.38)' }}
                onClick={() => router.push(`/workouts/${workout.id}/edit`)}>
                <Edit size={13}/>
              </button>
              <button className="wc-btn del" style={{ color:'rgba(255,255,255,.38)' }}
                onClick={() => setShowConfirm(true)}>
                <Trash2 size={13}/>
              </button>
            </div>
          </div>

          <div className="wc-stats">
            <div className="wc-stat">
              <Clock size={13} style={{ color:'#818cf8' }}/>
              <span className="wc-stat-val">{workout.durationMinutes}</span>
              <span className="wc-stat-unit">นาที</span>
            </div>
            <div className="wc-stat">
              <Flame size={13} style={{ color:'#f472b6' }}/>
              <span className="wc-stat-val">{Number(workout.caloriesBurned).toLocaleString()}</span>
              <span className="wc-stat-unit">cal</span>
            </div>
            {workout.distanceKm && Number(workout.distanceKm) > 0 && (
              <div className="wc-stat">
                <Route size={13} style={{ color:'#4ade80' }}/>
                <span className="wc-stat-val">{Number(workout.distanceKm).toFixed(1)}</span>
                <span className="wc-stat-unit">km</span>
              </div>
            )}
            {workout.imageUrl && (
              <div className="wc-stat" style={{ cursor:'pointer' }} onClick={() => setImgOpen(true)}>
                <ImageIcon size={13} style={{ color:'#22d3ee' }}/>
                <span className="wc-stat-unit" style={{ color:'#22d3ee', fontSize:12 }}>ดูรูป</span>
              </div>
            )}
          </div>

          {workout.notes && <div className="wc-notes">"{workout.notes}"</div>}
        </div>

        {showConfirm && (
          <div className="wc-confirm">
            <AlertTriangle size={22} style={{ color:'#f87171' }}/>
            <div className="wc-confirm-ttl">ลบ "{workout.exerciseType}"?</div>
            <div className="wc-confirm-row">
              <button className="wc-confirm-cancel" onClick={() => setShowConfirm(false)}>ยกเลิก</button>
              <button className="wc-confirm-ok" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'กำลังลบ...' : 'ลบเลย'}
              </button>
            </div>
          </div>
        )}
      </div>

      {imgOpen && workout.imageUrl && (
        <div className="wc-lb" onClick={() => setImgOpen(false)}>
          <button className="wc-lb-close"><X size={16}/></button>
          <img src={workout.imageUrl} alt={workout.exerciseType}
            onClick={e => e.stopPropagation()}/>
        </div>
      )}
    </>
  )
}
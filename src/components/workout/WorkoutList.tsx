'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store/authStore'
import { toast } from 'react-hot-toast'
import { Plus, Search, Activity, SlidersHorizontal, X } from 'lucide-react'
import Link from 'next/link'
import WorkoutCard from '@/components/workouts/WorkoutCard'

const TYPE_FILTERS = [
  { value:'all',    label:'ทั้งหมด' },
  { value:'วิ่ง',   label:'วิ่ง' },
  { value:'ปั่นจักรยาน', label:'ปั่น' },
  { value:'ว่ายน้ำ', label:'ว่ายน้ำ' },
  { value:'ยิม',    label:'ยิม' },
  { value:'โยคะ',   label:'โยคะ' },
  { value:'อื่นๆ',  label:'อื่นๆ' },
]

export default function WorkoutList() {
  const { token } = useAuthStore()
  const [workouts, setWorkouts] = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [search,  setSearch]    = useState('')
  const [filter,  setFilter]    = useState('all')

  useEffect(() => { fetchWorkouts() }, [])

  const fetchWorkouts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/workouts', { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) { const d = await res.json(); setWorkouts(d.workouts ?? []) }
      else toast.error('ไม่สามารถโหลดข้อมูลได้')
    } catch { toast.error('เกิดข้อผิดพลาด') }
    finally { setLoading(false) }
  }

  const filtered = workouts.filter(w => {
    const matchType   = filter === 'all' || w.exerciseType === filter
    const matchSearch = !search || w.exerciseType.toLowerCase().includes(search.toLowerCase())
      || (w.notes ?? '').toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@700;800&family=Sarabun:wght@400;500;600&display=swap');
        .wl{font-family:'Sarabun',sans-serif;color:#fff;display:flex;flex-direction:column;gap:16px}
        .wl-hd{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}
        .wl-title{font-family:'Syne',sans-serif;font-size:clamp(20px,2.5vw,28px);font-weight:800;
          letter-spacing:-.7px;margin-bottom:3px}
        .wl-sub{font-size:13px;color:rgba(255,255,255,.45)}
        .wl-add{display:inline-flex;align-items:center;gap:7px;padding:10px 20px;border-radius:50px;
          border:none;cursor:pointer;font-family:'Syne',sans-serif;font-size:14px;font-weight:700;
          color:#fff;background:linear-gradient(135deg,#5b21b6,#7c3aed,#a21caf);
          box-shadow:0 4px 20px rgba(91,33,182,.45);text-decoration:none;transition:all .2s;white-space:nowrap}
        .wl-add:hover{transform:translateY(-2px);box-shadow:0 7px 26px rgba(124,58,237,.6)}

        /* search + filter bar */
        .wl-bar{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
        .wl-search-wrap{position:relative;flex:1;min-width:180px}
        .wl-search-ico{position:absolute;left:12px;top:50%;transform:translateY(-50%);
          color:rgba(255,255,255,.3);pointer-events:none}
        .wl-search{width:100%;padding:10px 36px 10px 36px;border-radius:12px;
          background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.09);
          color:#fff;font-family:'Sarabun',sans-serif;font-size:13px;outline:none;
          transition:border-color .18s;box-sizing:border-box}
        .wl-search::placeholder{color:rgba(255,255,255,.25)}
        .wl-search:focus{border-color:rgba(129,140,248,.5)}
        .wl-search-clear{position:absolute;right:10px;top:50%;transform:translateY(-50%);
          background:none;border:none;cursor:pointer;color:rgba(255,255,255,.4);
          display:flex;align-items:center;padding:0}
        .wl-filters{display:flex;gap:6px;flex-wrap:wrap}
        .wl-filter-btn{padding:7px 13px;border-radius:9px;border:1px solid rgba(255,255,255,.08);
          background:rgba(255,255,255,.03);cursor:pointer;font-family:'Syne',sans-serif;
          font-size:12px;font-weight:700;color:rgba(255,255,255,.45);transition:all .15s;outline:none}
        .wl-filter-btn:hover{color:rgba(255,255,255,.75);background:rgba(255,255,255,.07)}
        .wl-filter-btn.act{background:rgba(129,140,248,.18);border-color:rgba(129,140,248,.38);color:#c4b5fd}

        /* grid */
        .wl-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px}

        /* skeleton */
        .wl-skel{border-radius:20px;background:rgba(129,140,248,.05);animation:_sk 1.6s ease-in-out infinite}
        @keyframes _sk{0%,100%{opacity:.3}50%{opacity:.7}}

        /* empty */
        .wl-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;
          padding:60px 24px;gap:12px;
          background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:22px}
        .wl-empty-ico{width:56px;height:56px;border-radius:16px;
          background:rgba(129,140,248,.1);border:1px solid rgba(129,140,248,.2);
          display:flex;align-items:center;justify-content:center;color:#818cf8}
        .wl-empty-ttl{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;color:rgba(255,255,255,.6)}
        .wl-empty-sub{font-size:12px;color:rgba(255,255,255,.35);text-align:center}
        .wl-count{font-size:12px;color:rgba(255,255,255,.4);font-family:'DM Mono',monospace}
      `}</style>

      <div className="wl">
        {/* header */}
        <div className="wl-hd">
          <div>
            <div className="wl-title">🏃 การออกกำลังกาย</div>
            <div className="wl-sub">ประวัติการออกกำลังกายทั้งหมดของคุณ</div>
          </div>
          <Link href="/workouts/new" className="wl-add"><Plus size={15}/> เพิ่มการออกกำลังกาย</Link>
        </div>

        {/* search + filter */}
        <div>
          <div className="wl-bar" style={{ marginBottom:10 }}>
            <div className="wl-search-wrap">
              <Search size={14} className="wl-search-ico"/>
              <input className="wl-search" placeholder="ค้นหา..." value={search} onChange={e => setSearch(e.target.value)}/>
              {search && (
                <button className="wl-search-clear" onClick={() => setSearch('')}><X size={13}/></button>
              )}
            </div>
          </div>
          <div className="wl-filters">
            {TYPE_FILTERS.map(f => (
              <button key={f.value}
                className={`wl-filter-btn ${filter === f.value ? 'act' : ''}`}
                onClick={() => setFilter(f.value)}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* count */}
        {!loading && (
          <div className="wl-count">
            {filtered.length} รายการ{filter !== 'all' || search ? ' (กรอง)' : ''}
          </div>
        )}

        {/* content */}
        {loading ? (
          <div className="wl-grid">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="wl-skel" style={{ height:200, animationDelay:`${i*0.1}s` }}/>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="wl-empty">
            <div className="wl-empty-ico"><Activity size={24}/></div>
            <div className="wl-empty-ttl">
              {search || filter !== 'all' ? 'ไม่พบรายการที่ค้นหา' : 'ยังไม่มีการออกกำลังกาย'}
            </div>
            <div className="wl-empty-sub">
              {search || filter !== 'all' ? 'ลองเปลี่ยนตัวกรองหรือคำค้นหา' : 'เริ่มบันทึกการออกกำลังกายแรกของคุณวันนี้!'}
            </div>
            {!search && filter === 'all' && (
              <Link href="/workouts/new" className="wl-add" style={{ marginTop:4, fontSize:13, padding:'8px 16px' }}>
                <Plus size={13}/> เพิ่มเลย
              </Link>
            )}
          </div>
        ) : (
          <div className="wl-grid">
            {filtered.map(w => (
              <WorkoutCard key={w.id} workout={w} onDelete={fetchWorkouts}/>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
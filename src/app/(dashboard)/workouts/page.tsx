'use client'

import { useEffect, useState } from 'react'
import WorkoutCard from '@/components/workout/WorkoutCard'
import { useAuthStore } from '@/lib/store/authStore'
import { toast } from 'react-hot-toast'
import { Plus, Search, X, ChevronLeft, ChevronRight, Activity, Flame, Clock } from 'lucide-react'
import Link from 'next/link'

const TYPE_FILTERS = [
  { value:'all',          label:'ทั้งหมด',     icon:'' },
  { value:'วิ่ง',         label:'วิ่ง',         icon:'🏃' },
  { value:'เดิน',         label:'เดิน',         icon:'🚶' },
  { value:'วิ่งเทรล',    label:'วิ่งเทรล',     icon:'🏔️' },
  { value:'ปั่นจักรยาน', label:'ปั่นจักรยาน',  icon:'🚴' },
  { value:'ว่ายน้ำ',     label:'ว่ายน้ำ',      icon:'🏊' },
  { value:'กระโดดเชือก', label:'กระโดดเชือก',  icon:'⚡' },
  { value:'ยิม',         label:'ยิม',           icon:'🏋️' },
  { value:'โยคะ',        label:'โยคะ',          icon:'🧘' },
  { value:'เอโรบิก',    label:'เอโรบิก',       icon:'💃' },
  { value:'มวย',         label:'มวย',           icon:'🥊' },
  { value:'บาสเก็ตบอล', label:'บาสเก็ตบอล',   icon:'🏀' },
  { value:'ฟุตบอล',     label:'ฟุตบอล',        icon:'⚽' },
  { value:'เทนนิส',     label:'เทนนิส',        icon:'🎾' },
  { value:'แบดมินตัน',  label:'แบดมินตัน',     icon:'🏸' },
  { value:'อื่นๆ',      label:'อื่นๆ',          icon:'✨' },
]

export default function WorkoutsPage() {
  const { token } = useAuthStore()
  const [workouts, setWorkouts]     = useState<any[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [filter, setFilter]         = useState('all')
  const [page, setPage]             = useState(1)
  const [pagination, setPagination] = useState<any>(null)

  useEffect(() => { fetchWorkouts() }, [page, filter])

  const fetchWorkouts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '12' })
      if (filter !== 'all') params.append('exerciseType', filter)
      const res = await fetch(`/api/workouts?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const d = await res.json()
        setWorkouts(d.workouts ?? [])
        setPagination(d.pagination)
      } else toast.error('ไม่สามารถโหลดข้อมูลได้')
    } catch { toast.error('เกิดข้อผิดพลาด') }
    finally { setLoading(false) }
  }

  const displayed = workouts.filter(w =>
    !search ||
    w.exerciseType.toLowerCase().includes(search.toLowerCase()) ||
    (w.notes ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const totalCal = workouts.reduce((s, w) => s + Number(w.caloriesBurned ?? 0), 0)
  const totalMin = workouts.reduce((s, w) => s + Number(w.durationMinutes ?? 0), 0)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@700;800&family=Sarabun:wght@400;500;600&display=swap');
        .wp{font-family:'Sarabun',sans-serif;color:#fff;display:flex;flex-direction:column;gap:22px}

        .wp-hd{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}
        .wp-title{font-family:'Syne',sans-serif;font-size:clamp(24px,3vw,32px);font-weight:800;letter-spacing:-.8px;margin-bottom:5px}
        .wp-sub{font-size:14px;color:rgba(255,255,255,.45)}
        .wp-add{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:50px;border:none;cursor:pointer;
          font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:#fff;
          background:linear-gradient(135deg,#5b21b6,#7c3aed,#a21caf);
          box-shadow:0 4px 20px rgba(91,33,182,.45);text-decoration:none;transition:all .2s;white-space:nowrap}
        .wp-add:hover{transform:translateY(-2px);box-shadow:0 7px 26px rgba(124,58,237,.6)}

        /* summary cards */
        .wp-summ{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
        .wp-sc{border-radius:20px;padding:20px 18px;position:relative;overflow:hidden;
          background:rgba(13,13,26,.85);border:1px solid rgba(255,255,255,.08);
          backdrop-filter:blur(14px);display:flex;flex-direction:column;gap:10px}
        /* glow blob inside each card */
        .wp-sc::after{content:'';position:absolute;border-radius:50%;pointer-events:none;
          width:160px;height:160px;bottom:-40px;right:-40px;filter:blur(35px);opacity:.75}
        .wp-sc-v::after{background:radial-gradient(circle,rgba(99,102,241,0.9) 0%,transparent 70%)}
        .wp-sc-p::after{background:radial-gradient(circle,rgba(236,72,153,0.85) 0%,transparent 70%)}
        .wp-sc-c::after{background:radial-gradient(circle,rgba(20,184,166,0.8) 0%,transparent 70%)}
        .wp-sc-ico{width:40px;height:40px;border-radius:12px;
          display:flex;align-items:center;justify-content:center;flex-shrink:0;position:relative;z-index:1}
        .wp-sc-val{font-family:'DM Mono',monospace;font-size:clamp(22px,3vw,30px);
          font-weight:500;letter-spacing:-1.5px;line-height:1;position:relative;z-index:1}
        .wp-sc-lbl{font-size:13px;color:rgba(255,255,255,.45);position:relative;z-index:1}

        /* search */
        .wp-bar{display:flex;flex-direction:column;gap:12px}
        .wp-search-wrap{position:relative}
        .wp-search-ico{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:rgba(255,255,255,.3);pointer-events:none}
        .wp-search{width:100%;padding:13px 42px;border-radius:14px;
          background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.09);
          color:#fff;font-family:'Sarabun',sans-serif;font-size:15px;outline:none;
          transition:border-color .18s;box-sizing:border-box}
        .wp-search::placeholder{color:rgba(255,255,255,.25)}
        .wp-search:focus{border-color:rgba(129,140,248,.5)}
        .wp-search-clear{position:absolute;right:12px;top:50%;transform:translateY(-50%);
          background:none;border:none;cursor:pointer;color:rgba(255,255,255,.4);display:flex;align-items:center;padding:0}

        /* filters */
        .wp-filters{display:flex;gap:7px;flex-wrap:wrap}
        .wp-fb{padding:8px 15px;border-radius:10px;border:1px solid rgba(255,255,255,.08);
          background:rgba(255,255,255,.03);cursor:pointer;font-family:'Syne',sans-serif;
          font-size:13px;font-weight:700;color:rgba(255,255,255,.45);transition:all .15s;outline:none;
          white-space:nowrap;display:flex;align-items:center;gap:5px}
        .wp-fb:hover{color:rgba(255,255,255,.8);background:rgba(255,255,255,.08)}
        .wp-fb.act{background:rgba(129,140,248,.18);border-color:rgba(129,140,248,.4);color:#c4b5fd}

        /* grid */
        .wp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px}
        .wp-skel{border-radius:22px;height:200px;
          background:linear-gradient(135deg,rgba(129,140,248,.05),rgba(168,85,247,.04));
          border:1px solid rgba(255,255,255,.05);animation:_sk 1.6s ease-in-out infinite}
        @keyframes _sk{0%,100%{opacity:.25}50%{opacity:.65}}

        /* empty */
        .wp-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;
          padding:64px 24px;gap:14px;background:rgba(255,255,255,.02);
          border:1px solid rgba(255,255,255,.06);border-radius:24px}
        .wp-empty-ico{width:60px;height:60px;border-radius:16px;background:rgba(129,140,248,.1);
          border:1px solid rgba(129,140,248,.2);display:flex;align-items:center;justify-content:center;color:#818cf8}
        .wp-empty-ttl{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;color:rgba(255,255,255,.6)}
        .wp-empty-sub{font-size:13px;color:rgba(255,255,255,.35);text-align:center}

        /* pagination */
        .wp-page{display:flex;align-items:center;justify-content:center;gap:12px}
        .wp-page-btn{width:40px;height:40px;border-radius:11px;border:1px solid rgba(255,255,255,.1);
          background:rgba(255,255,255,.04);cursor:pointer;display:flex;align-items:center;
          justify-content:center;color:rgba(255,255,255,.6);transition:all .15s;outline:none}
        .wp-page-btn:hover:not(:disabled){background:rgba(255,255,255,.09);color:#fff}
        .wp-page-btn:disabled{opacity:.25;cursor:not-allowed}
        .wp-page-info{font-family:'DM Mono',monospace;font-size:13px;color:rgba(255,255,255,.4)}
        .wp-count{font-family:'DM Mono',monospace;font-size:13px;color:rgba(255,255,255,.35)}
      `}</style>

      <div className="wp">
        <div className="wp-hd">
          <div>
            <div className="wp-title">การออกกำลังกาย</div>
            <div className="wp-sub">บันทึกและติดตามการออกกำลังกายของคุณ</div>
          </div>
          <Link href="/workouts/new" className="wp-add"><Plus size={16}/> เพิ่มใหม่</Link>
        </div>

        {/* summary — glow cards */}
        {!loading && (
          <div className="wp-summ">
            <div className="wp-sc wp-sc-v">
              <div className="wp-sc-ico" style={{ background:'rgba(99,102,241,.15)', border:'1px solid rgba(99,102,241,.25)' }}>
                <Activity size={18} style={{ color:'#818cf8' }}/>
              </div>
              <div className="wp-sc-val">{pagination?.total ?? workouts.length}</div>
              <div className="wp-sc-lbl">ครั้งทั้งหมด</div>
            </div>
            <div className="wp-sc wp-sc-p">
              <div className="wp-sc-ico" style={{ background:'rgba(236,72,153,.12)', border:'1px solid rgba(236,72,153,.25)' }}>
                <Flame size={18} style={{ color:'#f472b6' }}/>
              </div>
              <div className="wp-sc-val">{totalCal.toLocaleString()}</div>
              <div className="wp-sc-lbl">cal หน้านี้</div>
            </div>
            <div className="wp-sc wp-sc-c">
              <div className="wp-sc-ico" style={{ background:'rgba(20,184,166,.12)', border:'1px solid rgba(20,184,166,.22)' }}>
                <Clock size={18} style={{ color:'#2dd4bf' }}/>
              </div>
              <div className="wp-sc-val">{totalMin}</div>
              <div className="wp-sc-lbl">นาที หน้านี้</div>
            </div>
          </div>
        )}

        {/* search + filter */}
        <div className="wp-bar">
          <div className="wp-search-wrap">
            <Search size={15} className="wp-search-ico"/>
            <input className="wp-search" placeholder="ค้นหาประเภทหรือโน้ต..."
              value={search} onChange={e => setSearch(e.target.value)}/>
            {search && (
              <button className="wp-search-clear" onClick={() => setSearch('')}><X size={14}/></button>
            )}
          </div>
          <div className="wp-filters">
            {TYPE_FILTERS.map(f => (
              <button key={f.value}
                className={`wp-fb ${filter === f.value ? 'act' : ''}`}
                onClick={() => { setFilter(f.value); setPage(1) }}>
                {f.icon && <span>{f.icon}</span>}{f.label}
              </button>
            ))}
          </div>
        </div>

        {!loading && (
          <div className="wp-count">
            {displayed.length} รายการ{filter !== 'all' || search ? ' (กรอง)' : ''}
          </div>
        )}

        {loading ? (
          <div className="wp-grid">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="wp-skel" style={{ animationDelay:`${i*0.1}s` }}/>
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="wp-empty">
            <div className="wp-empty-ico"><Activity size={26}/></div>
            <div className="wp-empty-ttl">
              {search || filter !== 'all' ? 'ไม่พบรายการที่ค้นหา' : 'ยังไม่มีการออกกำลังกาย'}
            </div>
            <div className="wp-empty-sub">
              {search || filter !== 'all' ? 'ลองเปลี่ยนตัวกรองหรือคำค้นหา' : 'เริ่มบันทึกการออกกำลังกายแรกของคุณ!'}
            </div>
            {!search && filter === 'all' && (
              <Link href="/workouts/new" className="wp-add" style={{ fontSize:13, padding:'9px 20px', marginTop:6 }}>
                <Plus size={14}/> เพิ่มเลย
              </Link>
            )}
          </div>
        ) : (
          <div className="wp-grid">
            {displayed.map(w => (
              <WorkoutCard key={w.id} workout={w} onDelete={fetchWorkouts}/>
            ))}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="wp-page">
            <button className="wp-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft size={17}/>
            </button>
            <span className="wp-page-info">หน้า {pagination.page} / {pagination.totalPages}</span>
            <button className="wp-page-btn" disabled={page === pagination.totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight size={17}/>
            </button>
          </div>
        )}
      </div>
    </>
  )
}
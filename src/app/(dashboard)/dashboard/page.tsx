'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store/authStore'
import { useSettingsStore } from '@/lib/store/settingsStore'
import { Activity, Flame, Clock, TrendingUp, TrendingDown, Plus, Zap, ChevronRight, ChevronLeft, Timer } from 'lucide-react'
import Link from 'next/link'
import { Tooltip, ResponsiveContainer, Area, AreaChart, XAxis, YAxis } from 'recharts'
import { toast } from 'react-hot-toast'

/* ─── types ─── */
interface WeekStats { workouts: number; calories: number; duration: number }
interface Stats {
  total: { workouts: number; calories: number; duration: number; distance: number }
  thisWeek: WeekStats
  lastWeek: WeekStats
  diff: WeekStats
  changes: WeekStats
}
interface ChartData { date: string; label: string; calories: number; duration: number; workouts: number }

/* ─── week builder ─── */
function buildWeekDays(w: 'sunday' | 'monday', offsetWeeks = 0) {
  const today = new Date()
  const start = w === 'sunday' ? 0 : 1
  const back  = (today.getDay() - start + 7) % 7
  const base  = new Date(today)
  base.setDate(today.getDate() - back + offsetWeeks * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base); d.setDate(base.getDate() + i)
    return d.toISOString().split('T')[0]
  })
}
const DAY_TH: Record<number, string> = { 0:'อา', 1:'จ', 2:'อ', 3:'พ', 4:'พฤ', 5:'ศ', 6:'ส' }
function fmt_date(ds: string) {
  const d = new Date(ds)
  return `${d.getDate()}/${d.getMonth() + 1}`
}

/* ─── SVG ring ─── */
function Ring({ pct, size = 100, thick = 9 }: { pct: number; size?: number; thick?: number }) {
  const r   = (size - thick) / 2
  const c   = 2 * Math.PI * r
  const arc = Math.min(pct, 100) / 100 * c
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <defs>
        <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#818cf8" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <filter id="rglow">
          <feGaussianBlur stdDeviation="3.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={thick}/>
      {arc > 0 && (
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke="url(#rg)" strokeWidth={thick}
          strokeDasharray={`${arc} ${c - arc}`} strokeLinecap="round"
          filter="url(#rglow)"/>
      )}
    </svg>
  )
}

/* ─── component ─── */
export default function DashboardPage() {
  const { user, token }   = useAuthStore()
  const { weekStartsOn }  = useSettingsStore()
  const [stats,      setStats]      = useState<Stats | null>(null)
  const [rawChart,   setRawChart]   = useState<ChartData[]>([])
  const [loading,    setLoading]    = useState(true)
  const [weekOffset, setWeekOffset] = useState(0)
  const [chartMode,  setChartMode]  = useState<'cal' | 'dur' | 'count'>('cal')
  const [viewMode,   setViewMode]   = useState<'chart' | 'table'>('chart')
  const [activeGoal, setActiveGoal] = useState<any | null>(null)

  useEffect(() => { loadSummary() }, [weekStartsOn])
  useEffect(() => { loadChart() },   [weekOffset, weekStartsOn])
  useEffect(() => { loadActiveGoal() }, [])

  const loadActiveGoal = async () => {
    try {
      const res = await fetch('/api/goals?status=active', { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        const sorted = (data.goals ?? []).sort((a: any, b: any) =>
          new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
        )
        setActiveGoal(sorted[0] ?? null)
      }
    } catch {}
  }

  const loadSummary = async () => {
    try {
      const days = buildWeekDays(weekStartsOn, 0)
      const url  = `/api/stats/summary?weekStartsOn=${weekStartsOn}&weekStart=${days[0]}`
      const res  = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) setStats(await res.json())
    } catch {}
  }

  const loadChart = async () => {
    try {
      setLoading(true)
      const days  = buildWeekDays(weekStartsOn, weekOffset)
      const start = days[0]; const end = days[6]
      const res   = await fetch(`/api/stats/chart?startDate=${start}&endDate=${end}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const j   = await res.json()
        const arr: any[] = Array.isArray(j) ? j : (j.data ?? [])
        setRawChart(arr.map((item: any) => ({
          ...item,
          date:     item.date ?? item.day ?? '',
          calories: Number(item.calories ?? item.cal ?? 0),
          duration: Number(item.duration ?? item.durationMinutes ?? item.minutes ?? item.totalDuration ?? item.total_duration ?? 0),
          workouts: Number(item.workouts ?? item.count ?? 0),
        })))
      }
    } catch { toast.error('ไม่สามารถโหลดข้อมูลได้') }
    finally  { setLoading(false) }
  }

  const weekDays   = buildWeekDays(weekStartsOn, weekOffset)
  const todayStr   = new Date().toISOString().split('T')[0]
  const isThisWeek = weekOffset === 0

  const chartData = weekDays.map(ds => {
    const d = new Date(ds)
    const f = rawChart.find(r => (r.date ?? '').startsWith(ds))
    return { label: DAY_TH[d.getDay()], date: ds, calories: f?.calories ?? 0, duration: f?.duration ?? 0, workouts: f?.workouts ?? 0, isToday: ds === todayStr }
  })

  const activeKey   = chartMode === 'cal' ? 'calories' : chartMode === 'dur' ? 'duration' : 'workouts'
  const activeColor = chartMode === 'cal' ? '#818cf8' : chartMode === 'dur' ? '#22d3ee' : '#4ade80'
  const activeUnit  = chartMode === 'cal' ? 'cal' : chartMode === 'dur' ? 'นาที' : 'ครั้ง'
  const hasData     = chartData.some(d => chartMode === 'cal' ? d.calories : chartMode === 'dur' ? d.duration : d.workouts > 0)

  const goalTarget   = activeGoal ? Number(activeGoal.targetValue)  : 0
  const goalCurrent  = activeGoal ? Number(activeGoal.currentValue) : 0
  const goalPct      = goalTarget > 0 ? Math.min(100, Math.round((goalCurrent / goalTarget) * 100)) : 0
  const goalDaysLeft = activeGoal ? Math.max(0, Math.ceil((new Date(activeGoal.endDate).getTime() - Date.now()) / 86400000)) : 0
  const goalUnitMap: Record<string, string> = { workouts:'ครั้ง', calories:'cal', duration:'นาที', distance:'km' }

  const ChartDot = (props: any) => {
    const { cx, cy, payload } = props
    if (!payload.isToday || !isThisWeek)
      return <circle key={cx} cx={cx} cy={cy} r={4} fill={activeColor} stroke="#070712" strokeWidth={2.5}/>
    return (
      <g key={cx}>
        <circle cx={cx} cy={cy} r={14} fill="rgba(236,72,153,0.15)"/>
        <circle cx={cx} cy={cy} r={7}  fill="#ec4899" stroke="#fda4af" strokeWidth={2}/>
      </g>
    )
  }

  const ChartTip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{
        background: 'rgba(7,7,18,0.97)',
        border: `1px solid ${activeColor}55`,
        borderRadius: 14, padding: '10px 18px',
        boxShadow: `0 16px 48px rgba(0,0,0,0.8), 0 0 20px ${activeColor}22`,
      }}>
        <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)', marginBottom:5, fontFamily:'Sarabun,sans-serif', letterSpacing:1 }}>{label}</div>
        <div style={{ fontSize:26, fontWeight:500, fontFamily:'"DM Mono",monospace', color:activeColor, letterSpacing:'-1.5px', lineHeight:1 }}>
          {payload[0].value.toLocaleString()}
          <span style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginLeft:6, fontFamily:'Sarabun,sans-serif', fontWeight:400, letterSpacing:0 }}>{activeUnit}</span>
        </div>
      </div>
    )
  }

  if (loading) return (
    <div style={{ display:'flex', flexDirection:'column', gap:14, padding:'4px 0' }}>
      {[110, 290, 90, 160].map((h, i) => (
        <div key={i} style={{
          height: h, borderRadius: 24,
          background: 'linear-gradient(135deg, rgba(129,140,248,0.05), rgba(236,72,153,0.04))',
          border: '1px solid rgba(129,140,248,0.08)',
          animation: '_sk 1.8s ease-in-out infinite',
          animationDelay: `${i * 0.18}s`,
        }}/>
      ))}
      <style>{`@keyframes _sk{0%,100%{opacity:.25}50%{opacity:.7}}`}</style>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@700;800&family=Sarabun:wght@400;500;600;700&display=swap');

        /* ── base ── */
        .db { font-family:'Sarabun',sans-serif; color:#fff; display:flex; flex-direction:column; gap:14px; padding:2px 0 }

        /* ── shimmer keyframe ── */
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse-ring { 0%,100%{opacity:.6} 50%{opacity:1} }

        /* ── header ── */
        .db-hd { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; animation:fadeUp .4s ease both }
        .db-name {
          font-family:'Syne',sans-serif;
          font-size:clamp(20px,2.5vw,26px); font-weight:800; letter-spacing:-.8px; margin-bottom:4px;
          background: linear-gradient(120deg,#e2d9f3 0%,#a78bfa 50%,#f472b6 100%);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
        }
        .db-sub { font-size:14px; color:rgba(255,255,255,.5); font-weight:400 }

        .btn-add {
          display:inline-flex; align-items:center; gap:7px;
          padding:10px 22px; border-radius:50px; border:none; cursor:pointer;
          font-family:'Syne',sans-serif; font-size:13px; font-weight:700; color:#fff; text-decoration:none;
          background: linear-gradient(135deg,#4c1d95,#7c3aed,#be185d);
          box-shadow: 0 4px 20px rgba(124,58,237,.45), inset 0 1px 0 rgba(255,255,255,.15);
          transition: transform .2s, box-shadow .2s; white-space:nowrap; position:relative; overflow:hidden;
        }
        .btn-add::after {
          content:''; position:absolute; inset:0;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.12),transparent);
          transform:translateX(-100%); transition:transform .5s;
        }
        .btn-add:hover { transform:translateY(-2px); box-shadow:0 10px 32px rgba(124,58,237,.65), inset 0 1px 0 rgba(255,255,255,.2) }
        .btn-add:hover::after { transform:translateX(100%) }

        /* ── goal card ── */
        .goal {
          border-radius:22px; padding:22px 24px; position:relative; overflow:hidden;
          background: linear-gradient(135deg, rgba(76,29,149,.65) 0%, rgba(109,40,217,.48) 50%, rgba(162,33,175,.38) 100%);
          border: 1px solid rgba(139,92,246,.25);
          box-shadow: 0 1px 0 rgba(255,255,255,.07) inset, 0 20px 60px rgba(109,40,217,.15);
          backdrop-filter: blur(24px);
          display:flex; align-items:center; justify-content:space-between; gap:16px;
          animation: fadeUp .35s ease both;
        }
        .goal::before {
          content:''; position:absolute; top:-80px; right:-60px;
          width:240px; height:240px; border-radius:50%;
          background: radial-gradient(circle, rgba(139,92,246,.2) 0%, transparent 70%);
          pointer-events:none;
        }
        .goal-lbl { font-size:10px; font-weight:700; letter-spacing:2.5px; text-transform:uppercase; color:rgba(167,139,250,.8); margin-bottom:7px }
        .goal-ttl { font-family:'Syne',sans-serif; font-size:clamp(15px,2vw,19px); font-weight:800; color:#fff; letter-spacing:-.4px; margin-bottom:5px }
        .goal-sub { font-size:13px; color:rgba(255,255,255,.6); margin-bottom:12px }
        .goal-ring { position:relative; display:flex; align-items:center; justify-content:center; flex-shrink:0 }
        .goal-pct { position:absolute; font-family:'DM Mono',monospace; font-size:17px; font-weight:500; color:#fff; letter-spacing:-.5px }

        /* progress bar */
        .prog-track { height:5px; border-radius:99px; background:rgba(255,255,255,.1); overflow:hidden }
        .prog-fill {
          height:100%; border-radius:99px;
          background: linear-gradient(90deg,#818cf8,#ec4899);
          box-shadow: 0 0 12px rgba(236,72,153,.5);
          transition: width .8s cubic-bezier(.22,1,.36,1);
        }

        /* ── stat cards ── */
        .sc-row { display:grid; grid-template-columns:repeat(3,1fr); gap:12px }
        @media(max-width:580px){ .sc-row{grid-template-columns:1fr 1fr} }

        .sc {
          border-radius:20px; padding:18px 18px 15px; position:relative; overflow:hidden;
          background: rgba(9,7,25,.82);
          border: 1px solid rgba(255,255,255,.07);
          backdrop-filter: blur(20px);
          box-shadow: 0 1px 0 rgba(255,255,255,.05) inset;
          transition: transform .22s, border-color .22s, box-shadow .22s;
          animation: fadeUp .4s ease both;
        }
        .sc:nth-child(1){animation-delay:.05s}
        .sc:nth-child(2){animation-delay:.1s}
        .sc:nth-child(3){animation-delay:.15s}
        .sc:hover { transform:translateY(-4px); box-shadow:0 20px 50px rgba(0,0,0,.5), 0 1px 0 rgba(255,255,255,.08) inset }
        .sc-v:hover{border-color:rgba(129,140,248,.35)}
        .sc-p:hover{border-color:rgba(236,72,153,.35)}
        .sc-c:hover{border-color:rgba(34,211,238,.35)}

        /* glow blobs behind numbers */
        .sc::after {
          content:''; position:absolute; bottom:-30px; right:-20px;
          width:90px; height:90px; border-radius:50%; filter:blur(28px); pointer-events:none; opacity:.4;
        }
        .sc-v::after{background:#818cf8}
        .sc-p::after{background:#ec4899}
        .sc-c::after{background:#22d3ee}

        .sc-ico {
          width:38px; height:38px; border-radius:11px;
          display:flex; align-items:center; justify-content:center; margin-bottom:13px;
        }
        .sc-v .sc-ico { background:rgba(129,140,248,.15); color:#818cf8; border:1px solid rgba(129,140,248,.2) }
        .sc-p .sc-ico { background:rgba(236,72,153,.15);  color:#f472b6; border:1px solid rgba(236,72,153,.2)  }
        .sc-c .sc-ico { background:rgba(34,211,238,.15);  color:#22d3ee; border:1px solid rgba(34,211,238,.2)  }

        .sc-num { font-family:'DM Mono',monospace; font-size:clamp(26px,3vw,34px); font-weight:500; line-height:1; letter-spacing:-2px; color:#fff }
        .sc-unit { font-family:'Sarabun',sans-serif; font-size:13px; color:rgba(255,255,255,.45); margin-left:5px; font-weight:500; letter-spacing:0 }
        .sc-lbl { font-size:12px; color:rgba(255,255,255,.5); margin-top:7px; font-weight:500 }
        .sc-chg { display:flex; align-items:center; gap:4px; font-size:12px; font-weight:700; margin-top:6px }
        .up   { color:#4ade80 }
        .down { color:#f87171 }

        /* ── panel ── */
        .panel {
          background: rgba(9,7,25,.82);
          border: 1px solid rgba(255,255,255,.07);
          box-shadow: 0 1px 0 rgba(255,255,255,.05) inset;
          border-radius:22px; padding:22px 22px 18px; backdrop-filter:blur(20px);
          animation: fadeUp .45s ease both;
        }
        .panel-ttl { font-family:'Syne',sans-serif; font-size:15px; font-weight:800; color:#fff; display:flex; align-items:center; gap:7px; letter-spacing:-.2px }
        .panel-sub { font-size:12px; color:rgba(255,255,255,.4); margin-top:3px; margin-bottom:16px; font-family:'DM Mono',monospace; letter-spacing:-.3px }

        /* ── chart toolbar ── */
        .chart-toolbar { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; margin-bottom:4px }
        .chart-toolbar-left { display:flex; align-items:center; gap:8px }
        .chart-toolbar-right { display:flex; align-items:center; gap:8px; flex-wrap:wrap }

        .week-nav { display:flex; align-items:center; gap:5px }
        .week-nav-btn {
          width:30px; height:30px; border-radius:8px; cursor:pointer;
          background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.08);
          color:rgba(255,255,255,.6); display:flex; align-items:center; justify-content:center;
          transition:all .16s;
        }
        .week-nav-btn:hover:not(:disabled) { background:rgba(129,140,248,.18); border-color:rgba(129,140,248,.3); color:#fff }
        .week-nav-btn:disabled { opacity:.25; cursor:not-allowed }
        .week-label { font-family:'DM Mono',monospace; font-size:11px; font-weight:500; color:rgba(255,255,255,.5); letter-spacing:-.2px; white-space:nowrap; padding:0 4px }
        .week-label.current { color:#a78bfa }

        .mode-toggle { display:flex; border-radius:9px; overflow:hidden; border:1px solid rgba(255,255,255,.09); background:rgba(0,0,0,.3) }
        .mode-btn {
          padding:5px 12px; border:none; cursor:pointer;
          font-family:'Syne',sans-serif; font-size:11px; font-weight:700;
          color:rgba(255,255,255,.45); background:transparent;
          transition:all .15s; display:flex; align-items:center; gap:5px; white-space:nowrap;
        }
        .mode-btn.active { background:rgba(129,140,248,.2); color:#c4b5fd }
        .mode-btn:hover:not(.active) { color:rgba(255,255,255,.7) }

        .wbadge {
          font-size:11px; color:rgba(167,139,250,.8);
          background:rgba(129,140,248,.1); border:1px solid rgba(129,140,248,.18);
          border-radius:6px; padding:4px 10px; white-space:nowrap; font-family:'Sarabun',sans-serif; font-weight:600;
        }

        /* ── quick actions ── */
        .qa {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 8px;
        }
        .qa-btn {
          height: 48px;
          border-radius: 12px;
          cursor: pointer;
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-decoration: none;
          transition: all .18s;
          color: rgba(255,255,255,.55);
          background: rgba(255,255,255,.04);
          border: 0.5px solid rgba(255,255,255,.1);
        }
        .qa-btn:hover {
          background: rgba(255,255,255,.08);
          border-color: rgba(255,255,255,.18);
          color: rgba(255,255,255,.9);
          transform: translateY(-2px);
        }
        .qa-pri {
          background: linear-gradient(135deg, #4c1d95, #7c3aed, #be185d);
          border: none;
          color: #fff;
          box-shadow: 0 2px 12px rgba(124,58,237,.35);
        }
        .qa-pri:hover {
          box-shadow: 0 6px 22px rgba(124,58,237,.55);
          border: none;
          color: #fff;
        }

        /* ── bottom grid ── */
        .bg2 { display:grid; grid-template-columns:1fr 1fr; gap:12px }
        @media(max-width:580px){ .bg2{grid-template-columns:1fr} }

        .sri {
          display:flex; justify-content:space-between; align-items:center;
          padding:12px 14px; border-radius:12px; margin-bottom:8px;
          background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.06);
          transition: background .16s, border-color .16s;
        }
        .sri:last-child { margin-bottom:0 }
        .sri:hover { background:rgba(255,255,255,.055); border-color:rgba(255,255,255,.1) }
        .sri-lbl { font-size:13px; color:rgba(255,255,255,.55); font-weight:500 }
        .sri-num { font-family:'DM Mono',monospace; font-size:21px; font-weight:500; letter-spacing:-1px }
        .sri-unit { font-size:11px; color:rgba(255,255,255,.38); margin-left:4px; font-family:'Sarabun',sans-serif }

        /* ── banner ── */
        .banner {
          border-radius:22px; padding:24px 28px; position:relative; overflow:hidden;
          background: linear-gradient(135deg, #2d1068 0%, #4c1d95 20%, #6d28d9 50%, #9d174d 80%, #be185d 100%);
          border: 1px solid rgba(255,255,255,.1);
          box-shadow: 0 2px 0 rgba(255,255,255,.1) inset, 0 20px 60px rgba(109,40,217,.25);
          animation: fadeUp .5s ease both;
        }
        .banner::before {
          content:''; position:absolute; top:-70px; right:-50px;
          width:220px; height:220px; border-radius:50%;
          background:radial-gradient(circle, rgba(255,255,255,.08) 0%, transparent 70%);
          pointer-events:none;
        }
        .banner::after {
          content:''; position:absolute; bottom:-40px; left:15%;
          width:150px; height:150px; border-radius:50%;
          background:radial-gradient(circle, rgba(255,255,255,.05) 0%, transparent 70%);
          pointer-events:none;
        }
        .bn-ttl { font-family:'Syne',sans-serif; font-size:20px; font-weight:800; color:#fff; margin-bottom:6px; position:relative; z-index:1; letter-spacing:-.4px }
        .bn-sub { font-size:14px; color:rgba(255,255,255,.75); line-height:1.65; margin-bottom:18px; position:relative; z-index:1; max-width:480px }
        .bn-row { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; position:relative; z-index:1 }
        .bn-stat { font-size:13px; color:rgba(255,255,255,.6) }
        .bn-stat strong { font-family:'DM Mono',monospace; font-size:22px; font-weight:500; color:#fff; letter-spacing:-1px; margin-right:5px }
        .bn-cta {
          display:inline-flex; align-items:center; gap:6px;
          padding:10px 18px; border-radius:50px;
          background:rgba(255,255,255,.14); border:1px solid rgba(255,255,255,.22);
          backdrop-filter:blur(10px); font-family:'Syne',sans-serif; font-size:13px; font-weight:700;
          color:#fff; text-decoration:none; transition:all .2s;
        }
        .bn-cta:hover { background:rgba(255,255,255,.24); transform:translateX(2px) }

        .empty { display:flex; flex-direction:column; align-items:center; justify-content:center; height:180px; gap:10px }
        .empty-txt { font-size:13px; color:rgba(255,255,255,.4); font-family:'Sarabun',sans-serif }

        /* view toggle */
        .view-toggle-btn {
          padding:5px 12px; border-radius:9px; cursor:pointer;
          font-family:'Syne',sans-serif; font-size:11px; font-weight:700;
          color:rgba(255,255,255,.5);
          background:rgba(255,255,255,.04);
          border:1px solid rgba(255,255,255,.09);
          transition:all .16s; white-space:nowrap;
        }
        .view-toggle-btn:hover { background:rgba(129,140,248,.15); border-color:rgba(129,140,248,.3); color:#fff }
        .view-toggle-btn.active { background:rgba(129,140,248,.2); border-color:rgba(129,140,248,.35); color:#c4b5fd }
      `}</style>

      <div className="db">

        {/* ── header ── */}
        <div className="db-hd">
          <div>
            <div className="db-name">สวัสดี, {user?.name || user?.username}! 👋</div>
            <div className="db-sub">ติดตามความก้าวหน้าการออกกำลังกายของคุณ</div>
          </div>
          <Link href="/workouts/new" className="btn-add">
            <Plus size={14}/> เพิ่มการออกกำลังกาย
          </Link>
        </div>

        {/* ── goal card ── */}
        {activeGoal ? (
          <div className="goal">
            <div style={{ flex:1, minWidth:0 }}>
              <div className="goal-lbl">🎯 เป้าหมายปัจจุบัน</div>
              <div className="goal-ttl">{activeGoal.title}</div>
              <div className="goal-sub">
                {goalPct >= 100
                  ? '🎉 บรรลุเป้าหมายแล้ว!'
                  : `${goalCurrent.toLocaleString()} / ${goalTarget.toLocaleString()} ${goalUnitMap[activeGoal.targetType] ?? ''} • เหลือ ${goalDaysLeft} วัน`}
              </div>
              <div className="prog-track">
                <div className="prog-fill" style={{ width:`${goalPct}%` }}/>
              </div>
            </div>
            <div className="goal-ring">
              <Ring pct={goalPct} size={92} thick={8}/>
              <span className="goal-pct">{goalPct}%</span>
            </div>
          </div>
        ) : (
          <div className="goal" style={{ justifyContent:'center' }}>
            <div style={{ textAlign:'center' }}>
              <div className="goal-lbl" style={{ marginBottom:8 }}>🎯 เป้าหมาย</div>
              <div className="goal-ttl" style={{ fontSize:15, opacity:.6 }}>ยังไม่มีเป้าหมายที่กำลังดำเนินการ</div>
              <div className="goal-sub" style={{ marginTop:8 }}>
                <Link href="/goals" style={{ display:'inline-flex', alignItems:'center', gap:5, color:'#a78bfa', fontSize:13, textDecoration:'none', fontFamily:'Sarabun,sans-serif' }}>
                  <Plus size={12}/> สร้างเป้าหมายใหม่
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── stat cards ── */}
        <div className="sc-row">
          {([
            { cls:'sc-v', Icon:Activity, num:stats?.thisWeek.workouts ?? 0, unit:'ครั้ง', lbl:'สัปดาห์นี้',  diff:stats?.diff.workouts,  chg:stats?.changes.workouts },
            { cls:'sc-p', Icon:Flame,    num:stats?.thisWeek.calories ?? 0, unit:'cal',   lbl:'แคลอรี่',      diff:stats?.diff.calories,   chg:stats?.changes.calories },
            { cls:'sc-c', Icon:Clock,    num:stats?.thisWeek.duration ?? 0, unit:'นาที',  lbl:'เวลา',         diff:stats?.diff.duration,   chg:stats?.changes.duration },
          ] as const).map(({ cls, Icon, num, unit, lbl, diff, chg }) => (
            <div key={lbl} className={`sc ${cls}`}>
              <div className="sc-ico"><Icon size={18}/></div>
              <div>
                <span className="sc-num">{num.toLocaleString()}</span>
                <span className="sc-unit">{unit}</span>
              </div>
              <div className="sc-lbl">{lbl}</div>
              {diff !== undefined && chg !== undefined && (
                <div className={`sc-chg ${chg >= 0 ? 'up' : 'down'}`}>
                  {chg >= 0 ? <TrendingUp size={11}/> : <TrendingDown size={11}/>}
                  <span>{diff >= 0 ? '+' : ''}{diff.toLocaleString()} {unit}</span>
                  <span style={{opacity:.6}}>({Math.abs(chg)}%)</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── chart ── */}
        <div className="panel">
          <div className="chart-toolbar">
            <div className="chart-toolbar-left">
              <div className="panel-ttl">
                <Zap size={14} style={{ color:'#818cf8' }}/>
                {chartMode === 'cal' ? 'แคลอรี่' : chartMode === 'dur' ? 'เวลา' : 'จำนวนครั้ง'}รายสัปดาห์
              </div>
            </div>
            <div className="chart-toolbar-right">
              <div className="week-nav">
                <button className="week-nav-btn" onClick={() => setWeekOffset(w => w - 1)} title="สัปดาห์ก่อน">
                  <ChevronLeft size={14}/>
                </button>
                <span className={`week-label${isThisWeek ? ' current' : ''}`}>
                  {isThisWeek ? 'สัปดาห์นี้' : `${fmt_date(weekDays[0])} – ${fmt_date(weekDays[6])}`}
                </span>
                <button className="week-nav-btn" onClick={() => setWeekOffset(w => w + 1)} disabled={weekOffset >= 0} title="สัปดาห์ถัดไป">
                  <ChevronRight size={14}/>
                </button>
              </div>
              <div className="mode-toggle">
                <button className={`mode-btn${chartMode === 'cal' ? ' active' : ''}`} onClick={() => setChartMode('cal')}>
                  <Flame size={11}/> แคลอรี่
                </button>
                <button className={`mode-btn${chartMode === 'dur' ? ' active' : ''}`} onClick={() => setChartMode('dur')}>
                  <Timer size={11}/> เวลา
                </button>
                <button className={`mode-btn${chartMode === 'count' ? ' active' : ''}`} onClick={() => setChartMode('count')}>
                  <Activity size={11}/> ครั้ง
                </button>
              </div>
              <button
                className={`view-toggle-btn${viewMode === 'table' ? ' active' : ''}`}
                onClick={() => setViewMode(v => v === 'chart' ? 'table' : 'chart')}
                title={viewMode === 'chart' ? 'ดูตาราง' : 'ดูกราฟ'}
              >
                {viewMode === 'chart' ? '⊞ ตาราง' : '📈 กราฟ'}
              </button>
              <span className="wbadge">เริ่ม{weekStartsOn === 'sunday' ? 'อาทิตย์' : 'จันทร์'}</span>
            </div>
          </div>

          <div className="panel-sub">{weekDays[0]} — {weekDays[6]}</div>

          {viewMode === 'table' ? (
            /* ── TABLE VIEW ── */
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'separate', borderSpacing:'0 6px' }}>
                <thead>
                  <tr>
                    {['วัน','แคลอรี่ (cal)','เวลา (นาที)','จำนวนครั้ง'].map((h, i) => (
                      <th key={h} style={{
                        padding:'8px 14px', textAlign: i === 0 ? 'left' : 'right',
                        fontSize:11, fontWeight:700, letterSpacing:1.5,
                        color:'rgba(255,255,255,.35)', fontFamily:'Syne,sans-serif', textTransform:'uppercase',
                        whiteSpace:'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((row, i) => {
                    const isToday = row.isToday && isThisWeek
                    return (
                      <tr key={i} style={{
                        background: isToday ? 'rgba(236,72,153,0.08)' : i % 2 === 0 ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.015)',
                        transition:'background .15s',
                      }}>
                        <td style={{
                          padding:'11px 14px', borderRadius:'10px 0 0 10px',
                          fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:14,
                          color: isToday ? '#f472b6' : 'rgba(255,255,255,.8)',
                          border: isToday ? '1px solid rgba(236,72,153,0.2)' : '1px solid transparent',
                          borderRight:'none',
                          display:'flex', alignItems:'center', gap:6,
                        }}>
                          {isToday && <span style={{ width:7, height:7, borderRadius:'50%', background:'#ec4899', display:'inline-block', boxShadow:'0 0 8px #ec4899', flexShrink:0 }}/>}
                          {row.label}
                          {isToday && <span style={{ fontSize:10, color:'#f9a8d4', fontWeight:500, opacity:.8 }}>วันนี้</span>}
                        </td>
                        <td style={{
                          padding:'11px 14px', textAlign:'right',
                          fontFamily:'"DM Mono",monospace', fontSize:15, fontWeight:500,
                          color: row.calories > 0 ? '#818cf8' : 'rgba(255,255,255,.2)',
                          border: isToday ? '1px solid rgba(236,72,153,0.2)' : '1px solid transparent',
                          borderLeft:'none', borderRight:'none',
                        }}>
                          {row.calories > 0 ? row.calories.toLocaleString() : '—'}
                        </td>
                        <td style={{
                          padding:'11px 14px', textAlign:'right',
                          fontFamily:'"DM Mono",monospace', fontSize:15, fontWeight:500,
                          color: row.duration > 0 ? '#22d3ee' : 'rgba(255,255,255,.2)',
                          border: isToday ? '1px solid rgba(236,72,153,0.2)' : '1px solid transparent',
                          borderLeft:'none', borderRight:'none',
                        }}>
                          {row.duration > 0 ? row.duration.toLocaleString() : '—'}
                        </td>
                        <td style={{
                          padding:'11px 14px', textAlign:'right', borderRadius:'0 10px 10px 0',
                          fontFamily:'"DM Mono",monospace', fontSize:15, fontWeight:500,
                          color: row.workouts > 0 ? '#4ade80' : 'rgba(255,255,255,.2)',
                          border: isToday ? '1px solid rgba(236,72,153,0.2)' : '1px solid transparent',
                          borderLeft:'none',
                        }}>
                          {row.workouts > 0 ? row.workouts : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td style={{ padding:'12px 14px', fontSize:12, fontWeight:700, color:'rgba(255,255,255,.5)', fontFamily:'Syne,sans-serif' }}>รวม</td>
                    <td style={{ padding:'12px 14px', textAlign:'right', fontFamily:'"DM Mono",monospace', fontSize:15, fontWeight:500, color:'#818cf8' }}>
                      {chartData.reduce((s,r)=>s+r.calories,0).toLocaleString()}
                    </td>
                    <td style={{ padding:'12px 14px', textAlign:'right', fontFamily:'"DM Mono",monospace', fontSize:15, fontWeight:500, color:'#22d3ee' }}>
                      {chartData.reduce((s,r)=>s+r.duration,0).toLocaleString()}
                    </td>
                    <td style={{ padding:'12px 14px', textAlign:'right', fontFamily:'"DM Mono",monospace', fontSize:15, fontWeight:500, color:'#4ade80' }}>
                      {chartData.reduce((s,r)=>s+r.workouts,0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : hasData ? (
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={chartData} margin={{ top:14, right:4, left:-22, bottom:0 }}>
                <defs>
                  <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={chartMode === 'cal' ? '#7c3aed' : chartMode === 'dur' ? '#0e7490' : '#15803d'} stopOpacity={0.65}/>
                    <stop offset="55%"  stopColor={chartMode === 'cal' ? '#a855f7' : chartMode === 'dur' ? '#22d3ee' : '#4ade80'} stopOpacity={0.2}/>
                    <stop offset="100%" stopColor={chartMode === 'cal' ? '#7c3aed' : chartMode === 'dur' ? '#0e7490' : '#15803d'} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="lg" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%"   stopColor={activeColor}/>
                    <stop offset="100%" stopColor={chartMode === 'cal' ? '#ec4899' : chartMode === 'dur' ? '#a5f3fc' : '#86efac'}/>
                  </linearGradient>
                  <filter id="lf">
                    <feGaussianBlur stdDeviation="2" result="b"/>
                    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>
                <XAxis dataKey="label" axisLine={false} tickLine={false}
                  tick={{ fill:'rgba(255,255,255,0.45)', fontSize:12, fontFamily:'Sarabun' }}/>
                <YAxis axisLine={false} tickLine={false}
                  tick={{ fill:'rgba(255,255,255,0.35)', fontSize:11, fontFamily:'"DM Mono",monospace' }}/>
                <Tooltip content={<ChartTip/>}
                  cursor={{ stroke:`${activeColor}33`, strokeWidth:1.5, strokeDasharray:'4 2' }}/>
                <Area type="monotone" dataKey={activeKey}
                  stroke="url(#lg)" strokeWidth={2.5} fill="url(#ag)"
                  dot={<ChartDot/>}
                  activeDot={{ r:8, fill:'#ec4899', stroke:'rgba(253,164,175,.6)', strokeWidth:2.5 }}
                  filter="url(#lf)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty">
              <Activity size={38} style={{ color:'rgba(129,140,248,.3)' }}/>
              <span className="empty-txt">
                {isThisWeek ? 'ยังไม่มีข้อมูลในสัปดาห์นี้' : 'ไม่มีข้อมูลในช่วงเวลานี้'}
              </span>
              {isThisWeek && (
                <Link href="/workouts/new" className="btn-add" style={{ fontSize:12, padding:'7px 16px' }}>
                  <Plus size={12}/> บันทึกเลย
                </Link>
              )}
            </div>
          )}
        </div>
        <div className="qa">
          <Link href="/workouts/new" className="qa-btn qa-pri"><Plus size={13}/> เพิ่มการออกกำลังกาย</Link>
          <Link href="/goals"        className="qa-btn" >🎯 ตั้งเป้าหมาย</Link>
          <Link href="/analytics"    className="qa-btn">📊 ดูสถิติ</Link>
          <Link href="/profile"      className="qa-btn">👤 โปรไฟล์</Link>
        </div>

        {/* ── bottom 2-col ── */}
        <div className="bg2">
          <div className="panel" style={{ animationDelay:'.1s' }}>
            <div className="panel-ttl" style={{ marginBottom:14 }}>📅 สัปดาห์นี้</div>
            {([
              { lbl:'การออกกำลังกาย', val:stats?.thisWeek.workouts ?? 0,                      unit:'ครั้ง', col:'#818cf8' },
              { lbl:'แคลอรี่',        val:(stats?.thisWeek.calories ?? 0).toLocaleString(),   unit:'cal',   col:'#f472b6' },
              { lbl:'เวลา',           val:stats?.thisWeek.duration ?? 0,                       unit:'นาที',  col:'#22d3ee' },
            ] as const).map(({ lbl, val, unit, col }) => (
              <div className="sri" key={lbl}>
                <span className="sri-lbl">{lbl}</span>
                <div>
                  <span className="sri-num" style={{ color:col }}>{val}</span>
                  <span className="sri-unit">{unit}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="panel" style={{ animationDelay:'.15s' }}>
            <div className="panel-ttl" style={{ marginBottom:14 }}>🏆 สถิติรวม</div>
            {([
              { lbl:'ระยะทางรวม',   val:(stats?.total.distance ?? 0).toFixed(1),                              unit:'km',   col:'#4ade80' },
              { lbl:'เวลารวม',      val:Math.floor((stats?.total.duration ?? 0) / 60),                        unit:'ชม.',  col:'#a78bfa' },
              { lbl:'เฉลี่ย/ครั้ง', val:stats?.total.workouts ? Math.round(stats.total.calories / stats.total.workouts) : 0, unit:'cal', col:'#fbbf24' },
            ] as const).map(({ lbl, val, unit, col }) => (
              <div className="sri" key={lbl}>
                <span className="sri-lbl">{lbl}</span>
                <div>
                  <span className="sri-num" style={{ color:col }}>{val}</span>
                  <span className="sri-unit">{unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── banner ── */}
        <div className="banner">
          <div className="bn-ttl">💪 คุณกำลังทำได้ดี!</div>
          <div className="bn-sub">ยอดเยี่ยม! ทำให้สุขภาพของคุณดีขึ้นทุกวัน ความพยายามของคุณจะนำไปสู่ผลลัพธ์ที่ยอดเยี่ยม</div>
          <div className="bn-row">
            <div className="bn-stat"><strong>{stats?.total.workouts ?? 0}</strong> ครั้งที่บันทึกแล้ว</div>
            <Link href="/workouts/new" className="bn-cta">
              เพิ่มการออกกำลังกายเลย <ChevronRight size={13}/>
            </Link>
          </div>
        </div>

      </div>
    </>
  )
}
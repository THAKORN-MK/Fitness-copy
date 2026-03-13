'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store/authStore'
import { toast } from 'react-hot-toast'
import { TrendingUp, Activity, Calendar, Target, Loader2, CheckCircle2, Trophy } from 'lucide-react'
import MonthlyChart from '@/components/charts/MonthlyChart'
import ExerciseBreakdown from '@/components/charts/ExerciseBreakdown'
import RecentWorkouts from '@/components/charts/RecentWorkouts'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

const darkCard: React.CSSProperties = {
  border: '1px solid rgba(139,92,246,0.2)',
  background: 'rgba(13,10,35,0.75)',
  backdropFilter: 'blur(20px)',
  boxShadow: '0 0 40px rgba(109,40,217,0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
  borderRadius: 20,
}

const goalTypeConfig: Record<string, { icon: string; color: string; unit: string }> = {
  workouts: { icon: '🏃', color: '#818cf8', unit: 'ครั้ง' },
  calories: { icon: '🔥', color: '#f472b6', unit: 'cal'   },
  duration: { icon: '⏱️', color: '#22d3ee', unit: 'นาที'  },
  distance: { icon: '📍', color: '#4ade80', unit: 'km'    },
}

export default function AnalyticsPage() {
  const { token } = useAuthStore()
  const [loading, setLoading]               = useState(true)
  const [monthlyData, setMonthlyData]       = useState<any[]>([])
  const [breakdownData, setBreakdownData]   = useState<any[]>([])
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([])
  const [completedGoals, setCompletedGoals] = useState<any[]>([])
  const [totalStats, setTotalStats] = useState({
    totalWorkouts: 0, totalCalories: 0, totalDuration: 0, averagePerWorkout: 0,
  })

  useEffect(() => { fetchAllData() }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const headers = { Authorization: `Bearer ${token}` }
      const [monthly, breakdown, recent, goalsRes] = await Promise.all([
        fetch('/api/analytics/monthly',      { headers }).then(r => r.json()),
        fetch('/api/analytics/breakdown',    { headers }).then(r => r.json()),
        fetch('/api/analytics/recent',       { headers }).then(r => r.json()),
        fetch('/api/goals?status=completed', { headers }).then(r => r.json()),
      ])

      setMonthlyData(monthly.data || [])
      setBreakdownData(breakdown.data || [])
      setRecentWorkouts(recent.workouts || [])

      // เรียงล่าสุดก่อนโดยใช้ endDate
      const sorted = (goalsRes.goals || []).sort((a: any, b: any) =>
        new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
      )
      setCompletedGoals(sorted)

      const bd = breakdown.data || []
      const totalWorkouts = bd.reduce((s: number, i: any) => s + (i.count    || 0), 0)
      const totalCalories = bd.reduce((s: number, i: any) => s + (i.calories || 0), 0)
      const totalDuration = bd.reduce((s: number, i: any) => s + (i.duration || 0), 0)
      setTotalStats({
        totalWorkouts,
        totalCalories: Math.round(totalCalories),
        totalDuration,
        averagePerWorkout: totalWorkouts > 0 ? Math.round(totalCalories / totalWorkouts) : 0,
      })
    } catch {
      toast.error('ไม่สามารถโหลดข้อมูลได้')
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, icon: Icon, suffix = '', accentColor = '#8b5cf6', glowColor = 'rgba(139,92,246,0.3)' }: any) => (
    <div style={{ ...darkCard, padding:'20px 22px', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:-30, right:-30, width:100, height:100, borderRadius:'50%', background:glowColor, filter:'blur(32px)', pointerEvents:'none' }}/>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
        <p style={{ color:'#9ca3af', fontSize:13, fontWeight:500 }}>{title}</p>
        <div style={{ width:34, height:34, borderRadius:10, background:`${accentColor}22`, border:`1px solid ${accentColor}44`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Icon style={{ width:16, height:16, color:accentColor }}/>
        </div>
      </div>
      <p style={{ fontSize:30, fontWeight:800, color:'#fff', letterSpacing:-0.5 }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
        <span style={{ fontSize:16, fontWeight:500, color:accentColor, marginLeft:4 }}>{suffix}</span>
      </p>
    </div>
  )

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:400, flexDirection:'column', gap:16 }}>
      <Loader2 style={{ width:36, height:36, color:'#8b5cf6', animation:'spin 1s linear infinite' }}/>
      <p style={{ color:'#7c6fa0', fontSize:14 }}>กำลังโหลดข้อมูล...</p>
    </div>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize:28, fontWeight:800, color:'#fff', margin:0, letterSpacing:-0.5 }}>📊 สถิติและการวิเคราะห์</h1>
        <p style={{ color:'#7c6fa0', marginTop:6, fontSize:14 }}>ภาพรวมและวิเคราะห์การออกกำลังกายของคุณ</p>
      </div>

      {/* Summary Stats */}
      <div style={{ display:'grid', gap:16, gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <StatCard title="จำนวนครั้งทั้งหมด" value={totalStats.totalWorkouts}                   icon={Activity}   suffix="ครั้ง" accentColor="#818cf8" glowColor="rgba(129,140,248,0.25)"/>
        <StatCard title="แคลอรี่ทั้งหมด"    value={totalStats.totalCalories}                   icon={TrendingUp} suffix="cal"  accentColor="#ec4899" glowColor="rgba(236,72,153,0.22)"/>
        <StatCard title="เวลาทั้งหมด"        value={Math.floor(totalStats.totalDuration / 60)} icon={Calendar}   suffix="ชม." accentColor="#22d3ee" glowColor="rgba(34,211,238,0.2)"/>
        <StatCard title="ค่าเฉลี่ย/ครั้ง"   value={totalStats.averagePerWorkout}               icon={Target}     suffix="cal" accentColor="#4ade80" glowColor="rgba(74,222,128,0.2)"/>
      </div>

      <MonthlyChart data={monthlyData} />
      <ExerciseBreakdown data={breakdownData} />
      <RecentWorkouts workouts={recentWorkouts} />

      {/* Achievement */}
      <div style={{ ...darkCard, padding:'24px', background:'linear-gradient(135deg,rgba(88,28,135,0.6) 0%,rgba(30,27,75,0.8) 100%)', border:'1px solid rgba(139,92,246,0.35)' }}>
        <h2 style={{ color:'#e9d5ff', fontSize:20, fontWeight:800, marginBottom:20 }}>🎖️ ความสำเร็จของคุณ</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:12 }}>
          {[
            { label:'ครั้งออกกำลังกาย',   value: totalStats.totalWorkouts,                  icon:'🏃' },
            { label:'ชั่วโมงออกกำลังกาย', value: Math.floor(totalStats.totalDuration / 60), icon:'⏱️' },
            { label:'แคลอรี่เผาผลาญ',     value: totalStats.totalCalories.toLocaleString(), icon:'🔥' },
            { label:'เป้าหมายสำเร็จ',      value: completedGoals.length,                    icon:'🎯' },
          ].map((item, i) => (
            <div key={i} style={{ background:'rgba(255,255,255,0.07)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:14, padding:'16px 12px', textAlign:'center' }}>
              <p style={{ fontSize:22, marginBottom:6 }}>{item.icon}</p>
              <p style={{ fontSize:24, fontWeight:800, color:'#fff', margin:'4px 0' }}>{item.value}</p>
              <p style={{ fontSize:12, color:'rgba(255,255,255,0.6)' }}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom 3-col */}
      <div style={{ display:'grid', gap:16, gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))' }}>

        {/* สถิติน่าสนใจ */}
        <div style={{ ...darkCard, padding:20 }}>
          <h3 style={{ color:'#c4b5fd', fontWeight:700, fontSize:15, marginBottom:14 }}>🏆 สถิติที่น่าสนใจ</h3>
          {[
            { label:'ประเภทที่ชอบที่สุด', value: breakdownData[0]?.exerciseType || '-' },
            { label:'เวลาเฉลี่ย/ครั้ง',   value: `${totalStats.totalWorkouts > 0 ? Math.round(totalStats.totalDuration / totalStats.totalWorkouts) : 0} นาที` },
          ].map((row, i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'9px 12px', borderRadius:10, background:'rgba(139,92,246,0.08)', border:'1px solid rgba(139,92,246,0.15)', marginBottom:8 }}>
              <span style={{ fontSize:13, color:'#9ca3af' }}>{row.label}:</span>
              <span style={{ fontSize:13, fontWeight:700, color:'#a78bfa' }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* สถิติรายเดือน */}
        <div style={{ ...darkCard, padding:20 }}>
          <h3 style={{ color:'#fbbf24', fontWeight:700, fontSize:15, marginBottom:14 }}>📅 สถิติรายเดือน</h3>
          {[
            { label:'เดือนนี้',         value:`${monthlyData[monthlyData.length-1]?.workouts || 0} ครั้ง` },
            { label:'แคลอรี่เดือนนี้', value:`${Math.round(monthlyData[monthlyData.length-1]?.calories || 0)} cal` },
            { label:'เฉลี่ย 6 เดือน',  value:`${monthlyData.length > 0 ? Math.round(monthlyData.reduce((s,m)=>s+m.workouts,0)/monthlyData.length) : 0} ครั้ง/เดือน` },
          ].map((row, i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'9px 12px', borderRadius:10, background:'rgba(251,191,36,0.07)', border:'1px solid rgba(251,191,36,0.15)', marginBottom:8 }}>
              <span style={{ fontSize:13, color:'#9ca3af' }}>{row.label}:</span>
              <span style={{ fontSize:13, fontWeight:700, color:'#fbbf24' }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* ── เป้าหมายที่สำเร็จล่าสุด ── */}
        <div style={{ ...darkCard, padding:20 }}>
          <h3 style={{ color:'#4ade80', fontWeight:700, fontSize:15, marginBottom:14, display:'flex', alignItems:'center', gap:7 }}>
            <Trophy size={15} style={{ color:'#4ade80' }}/> เป้าหมายที่สำเร็จล่าสุด
          </h3>

          {completedGoals.length === 0 ? (
            <div style={{ textAlign:'center', padding:'24px 0', color:'rgba(255,255,255,0.3)', fontSize:13 }}>
              <p style={{ fontSize:30, marginBottom:8 }}>🎯</p>
              ยังไม่มีเป้าหมายที่สำเร็จ
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {completedGoals.slice(0, 3).map((goal, i) => {
                const cfg      = goalTypeConfig[goal.targetType] ?? { icon:'🎯', color:'#a78bfa', unit:'' }
                const isLatest = i === 0
                return (
                  <div key={goal.id} style={{
                    display:'flex', alignItems:'center', gap:10,
                    padding:'10px 12px', borderRadius:12,
                    background: isLatest ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.04)',
                    border: isLatest ? '1px solid rgba(74,222,128,0.3)' : '1px solid rgba(255,255,255,0.07)',
                  }}>
                    {/* icon */}
                    <div style={{ width:34, height:34, borderRadius:10, background:`${cfg.color}18`, border:`1px solid ${cfg.color}33`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
                      {cfg.icon}
                    </div>
                    {/* info */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:13, fontWeight:700, color:'#fff', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {goal.title}
                      </p>
                      <p style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>
                        {Number(goal.targetValue).toLocaleString()} {cfg.unit}
                        {' · '}
                        {format(new Date(goal.endDate), 'd MMM yyyy', { locale: th })}
                      </p>
                    </div>
                    {/* badge */}
                    {isLatest ? (
                      <div style={{ display:'flex', alignItems:'center', gap:4, padding:'3px 9px', borderRadius:20, background:'rgba(74,222,128,0.15)', border:'1px solid rgba(74,222,128,0.3)', flexShrink:0 }}>
                        <CheckCircle2 size={11} style={{ color:'#4ade80' }}/>
                        <span style={{ fontSize:10, fontWeight:700, color:'#4ade80' }}>ล่าสุด</span>
                      </div>
                    ) : (
                      <CheckCircle2 size={16} style={{ color:'rgba(74,222,128,0.45)', flexShrink:0 }}/>
                    )}
                  </div>
                )
              })}

              {completedGoals.length > 3 && (
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.3)', textAlign:'center', marginTop:2 }}>
                  และอีก {completedGoals.length - 3} เป้าหมาย
                </p>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
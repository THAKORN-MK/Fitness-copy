'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store/authStore'
import { toast } from 'react-hot-toast'
import { Loader2, Target, Plus, X, Activity, Flame, Clock, Route, CheckCircle2, XCircle, Timer, TrendingUp } from 'lucide-react'
import GoalCard from '@/components/goals/GoalCard'
import CreateGoalForm from '@/components/goals/CreateGoalForm'

export default function GoalsPage() {
  const { token } = useAuthStore()
  const [goals, setGoals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => { fetchGoals() }, [activeTab])

  const fetchGoals = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/goals?status=${activeTab}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setGoals(data.goals)
      } else {
        toast.error('ไม่สามารถโหลดข้อมูลได้')
      }
    } catch {
      toast.error('เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  const activeGoals    = goals.filter(g => g.status === 'active')
  const completedGoals = goals.filter(g => g.status === 'completed')
  const failedGoals    = goals.filter(g => g.status === 'failed')

  const tabs = [
    { id: 'all',       label: 'ทั้งหมด',          count: goals.length },
    { id: 'active',    label: 'กำลังดำเนินการ',   count: activeGoals.length },
    { id: 'completed', label: 'สำเร็จแล้ว',        count: completedGoals.length },
    { id: 'failed',    label: 'ไม่สำเร็จ',          count: failedGoals.length },
  ]

  const shownGoals = activeTab === 'all' ? goals
    : activeTab === 'active'    ? activeGoals
    : activeTab === 'completed' ? completedGoals
    : failedGoals

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@700;800&family=Sarabun:wght@400;500;600&display=swap');

        .gp{font-family:'Sarabun',sans-serif;color:#fff;display:flex;flex-direction:column;gap:18px}

        /* header */
        .gp-hd{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}
        .gp-title{font-family:'Syne',sans-serif;font-size:clamp(22px,3vw,30px);font-weight:800;letter-spacing:-.8px;margin-bottom:4px}
        .gp-sub{font-size:14px;color:rgba(255,255,255,.55)}

        /* add btn */
        .gp-add-btn{display:inline-flex;align-items:center;gap:7px;padding:10px 20px;border-radius:50px;
          border:none;cursor:pointer;font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:#fff;
          background:linear-gradient(135deg,#5b21b6,#7c3aed,#a21caf);
          box-shadow:0 4px 22px rgba(91,33,182,.45);transition:all .2s;white-space:nowrap}
        .gp-add-btn:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(124,58,237,.6)}
        .gp-add-btn.close{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);box-shadow:none}
        .gp-add-btn.close:hover{background:rgba(255,255,255,.13);box-shadow:none}

        /* stat row */
        .gp-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
        @media(max-width:640px){.gp-stats{grid-template-columns:1fr 1fr}}
        .gst{border-radius:18px;padding:16px 18px;border:1px solid rgba(255,255,255,.07);
          background:rgba(13,13,26,.8);backdrop-filter:blur(12px);position:relative;overflow:hidden}
        .gst::after{content:'';position:absolute;bottom:-20px;right:-20px;width:80px;height:80px;
          border-radius:50%;filter:blur(24px);opacity:.5;pointer-events:none}
        .gst-all::after{background:#818cf8}
        .gst-active::after{background:#f59e0b}
        .gst-done::after{background:#4ade80}
        .gst-fail::after{background:#f87171}
        .gst-lbl{font-size:11px;color:rgba(255,255,255,.5);letter-spacing:.06em;text-transform:uppercase;margin-bottom:8px}
        .gst-num{font-family:'DM Mono',monospace;font-size:30px;font-weight:500;letter-spacing:-1px;line-height:1}
        .gst-all  .gst-num{color:#a78bfa}
        .gst-active .gst-num{color:#fbbf24}
        .gst-done .gst-num{color:#4ade80}
        .gst-fail .gst-num{color:#f87171}

        /* tabs */
        .gp-tabs{display:flex;gap:6px;flex-wrap:wrap}
        .gtab{padding:8px 16px;border-radius:10px;border:1px solid rgba(255,255,255,.08);cursor:pointer;
          font-family:'Syne',sans-serif;font-size:13px;font-weight:700;
          color:rgba(255,255,255,.45);background:rgba(255,255,255,.03);transition:all .16s}
        .gtab:hover{color:rgba(255,255,255,.75);background:rgba(255,255,255,.07)}
        .gtab.act{background:rgba(129,140,248,.18);border-color:rgba(129,140,248,.4);color:#c4b5fd}
        .gtab-count{display:inline-block;min-width:18px;text-align:center;
          margin-left:5px;padding:1px 5px;border-radius:5px;font-size:11px;
          background:rgba(255,255,255,.1);color:rgba(255,255,255,.6)}
        .gtab.act .gtab-count{background:rgba(129,140,248,.3);color:#e0d7ff}

        /* grid */
        .gp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px}

        /* empty */
        .gp-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;
          padding:64px 24px;gap:12px;
          background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:22px}
        .gp-empty-ico{width:60px;height:60px;border-radius:18px;
          background:rgba(129,140,248,.12);display:flex;align-items:center;justify-content:center;
          color:#818cf8;margin-bottom:4px}
        .gp-empty-ttl{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;color:rgba(255,255,255,.7)}
        .gp-empty-sub{font-size:13px;color:rgba(255,255,255,.4);text-align:center;max-width:260px}

        /* loader */
        .gp-loading{display:flex;flex-direction:column;gap:12px}
        .gp-skel{border-radius:20px;background:rgba(129,140,248,.05);animation:_sk 1.6s ease-in-out infinite}
        @keyframes _sk{0%,100%{opacity:.3}50%{opacity:.7}}
      `}</style>

      <div className="gp">
        {/* Header */}
        <div className="gp-hd">
          <div>
            <div className="gp-title">🎯 เป้าหมาย</div>
            <div className="gp-sub">ตั้งเป้าหมายและติดตามความคืบหน้าของคุณ</div>
          </div>
          <button
            className={`gp-add-btn ${showCreateForm ? 'close' : ''}`}
            onClick={() => setShowCreateForm(v => !v)}
          >
            {showCreateForm ? <><X size={15}/> ปิด</> : <><Plus size={15}/> สร้างเป้าหมาย</>}
          </button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <CreateGoalForm onSuccess={() => { setShowCreateForm(false); fetchGoals() }} />
        )}

        {/* Stats */}
        <div className="gp-stats">
          <div className="gst gst-all">
            <div className="gst-lbl">ทั้งหมด</div>
            <div className="gst-num">{goals.length}</div>
          </div>
          <div className="gst gst-active">
            <div className="gst-lbl">กำลังดำเนินการ</div>
            <div className="gst-num">{activeGoals.length}</div>
          </div>
          <div className="gst gst-done">
            <div className="gst-lbl">สำเร็จแล้ว</div>
            <div className="gst-num">{completedGoals.length}</div>
          </div>
          <div className="gst gst-fail">
            <div className="gst-lbl">ไม่สำเร็จ</div>
            <div className="gst-num">{failedGoals.length}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="gp-tabs">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`gtab ${activeTab === t.id ? 'act' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
              <span className="gtab-count">{t.count}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="gp-loading">
            {[1,2,3].map(i => (
              <div key={i} className="gp-skel" style={{ height: 160, animationDelay: `${i * 0.12}s` }}/>
            ))}
          </div>
        ) : shownGoals.length === 0 ? (
          <div className="gp-empty">
            <div className="gp-empty-ico"><Target size={28}/></div>
            <div className="gp-empty-ttl">
              {activeTab === 'all' ? 'ยังไม่มีเป้าหมาย'
               : activeTab === 'active' ? 'ไม่มีเป้าหมายที่กำลังดำเนินการ'
               : activeTab === 'completed' ? 'ยังไม่มีเป้าหมายที่สำเร็จ'
               : 'ไม่มีเป้าหมายที่ไม่สำเร็จ'}
            </div>
            <div className="gp-empty-sub">
              {activeTab === 'all' ? 'เริ่มสร้างเป้าหมายแรกของคุณวันนี้!'
               : 'ลองเปลี่ยนตัวกรองหรือสร้างเป้าหมายใหม่'}
            </div>
            {activeTab !== 'completed' && activeTab !== 'failed' && (
              <button className="gp-add-btn" style={{ marginTop: 8 }} onClick={() => setShowCreateForm(true)}>
                <Plus size={14}/> สร้างเป้าหมาย
              </button>
            )}
          </div>
        ) : (
          <div className="gp-grid">
            {shownGoals.map(goal => (
              <GoalCard key={goal.id} goal={goal} onDelete={fetchGoals} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

interface ExerciseBreakdownProps {
  data: any[]
}

const TYPE_GLOW: Record<string, string> = {
  'วิ่ง':          'rgba(129,140,248,0.28)',
  'วิ่งเทรล':      'rgba(129,140,248,0.28)',
  'ปั่นจักรยาน':  'rgba(251,191,36,0.22)',
  'ว่ายน้ำ':       'rgba(34,211,238,0.24)',
  'เดิน':          'rgba(74,222,128,0.22)',
  'กระโดดเชือก':  'rgba(250,204,21,0.24)',
  'ยิม':           'rgba(168,85,247,0.26)',
  'โยคะ':          'rgba(244,114,182,0.24)',
  'เอโรบิก':      'rgba(236,72,153,0.26)',
  'มวย':           'rgba(248,113,113,0.28)',
  'บาสเก็ตบอล':   'rgba(251,146,60,0.24)',
  'ฟุตบอล':       'rgba(74,222,128,0.24)',
  'เทนนิส':       'rgba(251,191,36,0.22)',
  'แบดมินตัน':    'rgba(129,140,248,0.22)',
  'อื่นๆ':        'rgba(167,139,250,0.22)',
}

const TYPE_COLOR: Record<string, string> = {
  'วิ่ง':          '#818cf8',
  'วิ่งเทรล':      '#6366f1',
  'ปั่นจักรยาน':  '#fbbf24',
  'ว่ายน้ำ':       '#22d3ee',
  'เดิน':          '#4ade80',
  'กระโดดเชือก':  '#facc15',
  'ยิม':           '#a855f7',
  'โยคะ':          '#f472b6',
  'เอโรบิก':      '#ec4899',
  'มวย':           '#f87171',
  'บาสเก็ตบอล':   'rgba(251,146,60,1)',
  'ฟุตบอล':       '#4ade80',
  'เทนนิส':       '#fbbf24',
  'แบดมินตัน':    '#818cf8',
  'อื่นๆ':        '#a78bfa',
}

const FALLBACK_COLORS = [
  '#818cf8','#ec4899','#22d3ee','#4ade80',
  '#fbbf24','#a855f7','#f87171','#34d399',
]

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0]
    return (
      <div style={{
        background: 'rgba(10,8,30,0.95)',
        border: `1px solid ${TYPE_COLOR[name] || '#8b5cf6'}66`,
        borderRadius: 12,
        padding: '10px 16px',
        boxShadow: `0 0 20px ${TYPE_GLOW[name] || 'rgba(139,92,246,0.25)'}`,
        backdropFilter: 'blur(12px)',
        color: '#fff',
        fontSize: 13,
      }}>
        <p style={{ color: TYPE_COLOR[name] || '#a78bfa', fontWeight: 700 }}>{name}</p>
        <p>{value} ครั้ง</p>
      </div>
    )
  }
  return null
}

export default function ExerciseBreakdown({ data }: ExerciseBreakdownProps) {
  const chartData = data.map(item => ({
    name: item.exerciseType,
    value: item.count,
  }))

  return (
    <Card style={{
      border: '1px solid rgba(139,92,246,0.2)',
      background: 'rgba(13,10,35,0.75)',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 0 40px rgba(109,40,217,0.12), inset 0 1px 0 rgba(255,255,255,0.05)',
      borderRadius: 20,
    }}>
      <CardHeader>
        <CardTitle style={{ color: '#e2d9f3', fontSize: 16, fontWeight: 700 }}>
          🎯 สัดส่วนตามประเภทการออกกำลังกาย
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <defs>
                  {chartData.map((entry, i) => {
                    const col = TYPE_COLOR[entry.name] || FALLBACK_COLORS[i % FALLBACK_COLORS.length]
                    return (
                      <radialGradient key={`rg-${i}`} id={`rg-${i}`} cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={col} stopOpacity={1} />
                        <stop offset="100%" stopColor={col} stopOpacity={0.7} />
                      </radialGradient>
                    )
                  })}
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  filter="url(#glow)"
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  labelLine={{ stroke: 'rgba(167,139,250,0.4)', strokeWidth: 1 }}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#rg-${index})`}
                      stroke={TYPE_COLOR[entry.name] || FALLBACK_COLORS[index % FALLBACK_COLORS.length]}
                      strokeWidth={1.5}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px',
              marginTop: 12,
            }}>
              {data.map((item, index) => {
                const col = TYPE_COLOR[item.exerciseType] || FALLBACK_COLORS[index % FALLBACK_COLORS.length]
                const glow = TYPE_GLOW[item.exerciseType] || 'rgba(139,92,246,0.22)'
                return (
                  <div key={item.exerciseType} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 10px',
                    borderRadius: 10,
                    background: `${glow}`,
                    border: `1px solid ${col}33`,
                  }}>
                    <div style={{
                      width: 10, height: 10,
                      borderRadius: '50%',
                      background: col,
                      boxShadow: `0 0 8px ${col}`,
                      flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 12, color: '#c4b5fd' }}>
                      {item.exerciseType}:
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginLeft: 'auto' }}>
                      {item.count} ครั้ง
                    </span>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <div style={{
            height: 280,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#7c6fa0',
            fontSize: 14,
          }}>
            ไม่มีข้อมูล
          </div>
        )}
      </CardContent>
    </Card>
  )
}
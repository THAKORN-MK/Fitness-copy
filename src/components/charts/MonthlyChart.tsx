'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface MonthlyChartProps {
  data: any[]
}

const METRICS = [
  { key: 'workouts',  label: 'จำนวนครั้ง', unit: 'ครั้ง', color: '#8b5cf6', grad: 'gradWorkouts', icon: '🏃' },
  { key: 'calories',  label: 'แคลอรี่',    unit: 'cal',   color: '#ec4899', grad: 'gradCalories', icon: '🔥' },
  { key: 'duration',  label: 'เวลา',        unit: 'นาที',  color: '#22d3ee', grad: 'gradDuration',  icon: '⏱️' },
]

const CustomTooltip = ({ active, payload, label, unit }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(10,8,30,0.95)',
        border: '1px solid rgba(139,92,246,0.45)',
        borderRadius: 14,
        padding: '12px 18px',
        boxShadow: '0 0 28px rgba(139,92,246,0.3)',
        backdropFilter: 'blur(16px)',
      }}>
        <p style={{ color: '#a78bfa', fontWeight: 700, marginBottom: 6, fontSize: 13 }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color, fontSize: 13, margin: '2px 0' }}>
            {p.name}:{' '}
            <span style={{ fontWeight: 700, color: '#fff' }}>
              {p.value?.toLocaleString()} {unit}
            </span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function MonthlyChart({ data }: MonthlyChartProps) {
  const [active, setActive] = useState('workouts')
  const metric = METRICS.find(m => m.key === active)!

  return (
    <Card style={{
      border: '1px solid rgba(139,92,246,0.2)',
      background: 'rgba(13,10,35,0.75)',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 0 40px rgba(109,40,217,0.12), inset 0 1px 0 rgba(255,255,255,0.05)',
      borderRadius: 20,
    }}>
      <CardHeader style={{ paddingBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <CardTitle style={{ color: '#e2d9f3', fontSize: 16, fontWeight: 700 }}>
            📊 สถิติรายเดือน (6 เดือนล่าสุด)
          </CardTitle>

          {/* Toggle buttons */}
          <div style={{
            display: 'flex', gap: 6,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12, padding: 4,
          }}>
            {METRICS.map(m => (
              <button
                key={m.key}
                onClick={() => setActive(m.key)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 9,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: 'inherit',
                  transition: 'all .18s',
                  background: active === m.key
                    ? `rgba(${m.color === '#8b5cf6' ? '139,92,246' : m.color === '#ec4899' ? '236,72,153' : '34,211,238'},0.25)`
                    : 'transparent',
                  color: active === m.key ? m.color : 'rgba(255,255,255,0.4)',
                  boxShadow: active === m.key ? `0 0 12px ${m.color}44` : 'none',
                }}
              >
                {m.icon} {m.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="gradWorkouts" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.55} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradCalories" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#ec4899" stopOpacity={0.48} />
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradDuration" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#22d3ee" stopOpacity={0.48} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.1)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: '#7c6fa0', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(139,92,246,0.2)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#7c6fa0', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip unit={metric.unit} />} />
            <Area
              key={active}
              type="monotone"
              dataKey={active}
              stroke={metric.color}
              strokeWidth={2.5}
              fill={`url(#${metric.grad})`}
              name={metric.label}
              dot={{ fill: metric.color, strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: metric.color }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
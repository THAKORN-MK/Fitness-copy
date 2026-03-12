'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface MonthlyChartProps {
  data: any[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
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
            {p.name}: <span style={{ fontWeight: 700, color: '#fff' }}>{p.value?.toLocaleString()}</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function MonthlyChart({ data }: MonthlyChartProps) {
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
          📊 สถิติรายเดือน (6 เดือนล่าสุด)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="gradWorkouts" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.55} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradCalories" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.48} />
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0.02} />
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
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: '#a78bfa', fontSize: 13, paddingTop: 12 }} />
            <Area
              type="monotone"
              dataKey="workouts"
              stroke="#8b5cf6"
              strokeWidth={2.5}
              fill="url(#gradWorkouts)"
              name="จำนวนครั้ง"
              dot={{ fill: '#8b5cf6', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: '#a78bfa' }}
            />
            <Area
              type="monotone"
              dataKey="calories"
              stroke="#ec4899"
              strokeWidth={2.5}
              fill="url(#gradCalories)"
              name="แคลอรี่"
              dot={{ fill: '#ec4899', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: '#f472b6' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
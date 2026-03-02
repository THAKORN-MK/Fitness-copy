'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BarChart, 
  Bar, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  ResponsiveContainer 
} from 'recharts'

interface IntensityChartProps {
  data: any[]
}

const intensityLabels: Record<string, string> = {
  low: 'เบา',
  medium: 'ปานกลาง',
  high: 'หนัก'
}

const intensityColors: Record<string, string> = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444'
}

export default function IntensityChart({ data }: IntensityChartProps) {
  const chartData = data.map(item => ({
    intensity: intensityLabels[item.intensity] || item.intensity,
    count: item.count,
    calories: Math.round(item.calories),
    fill: intensityColors[item.intensity] || '#6b7280'
  }))

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-lg">💪 การกระจายตามความหนัก</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="intensity" />
              <YAxis />
              <Tooltip />
              <Bar 
                dataKey="count" 
                name="จำนวนครั้ง"
                radius={[8, 8, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-gray-500">
            ไม่มีข้อมูล
          </div>
        )}
      </CardContent>
    </Card>
  )
}
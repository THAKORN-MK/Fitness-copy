'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Legend,
  Tooltip 
} from 'recharts'

interface ExerciseBreakdownProps {
  data: any[]
}

const COLORS = [
  '#3b82f6', // blue
  '#f97316', // orange
  '#10b981', // green
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#06b6d4', // cyan
  '#84cc16', // lime
]

export default function ExerciseBreakdown({ data }: ExerciseBreakdownProps) {
  const chartData = data.map(item => ({
    name: item.exerciseType,
    value: item.count
  }))

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-lg">🎯 สัดส่วนการออกกำลังกายตามประเภท</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => 
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            ไม่มีข้อมูล
          </div>
        )}
        
        {/* Custom Legend */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {data.map((item, index) => (
            <div key={item.exerciseType} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm">
                {item.exerciseType}: {item.count} ครั้ง
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
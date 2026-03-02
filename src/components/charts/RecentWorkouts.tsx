'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { Activity, Flame, Clock } from 'lucide-react'

interface RecentWorkoutsProps {
  workouts: any[]
}

export default function RecentWorkouts({ workouts }: RecentWorkoutsProps) {
  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'low': return 'bg-green-100 text-green-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'high': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getIntensityLabel = (intensity: string) => {
    switch (intensity) {
      case 'low': return 'เบา'
      case 'medium': return 'ปานกลาง'
      case 'high': return 'หนัก'
      default: return intensity
    }
  }

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-lg">🏃 การออกกำลังกายล่าสุด</CardTitle>
      </CardHeader>
      <CardContent>
        {workouts.length > 0 ? (
          <div className="space-y-3">
            {workouts.map((workout, index) => (
              <div 
                key={workout.id}
                className="flex items-start justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all duration-200 border border-gray-200/50 animate-fadeInUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-bold text-gray-900">{workout.exerciseType}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getIntensityColor(workout.intensity)}`}>
                      {getIntensityLabel(workout.intensity)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    {format(new Date(workout.exerciseDate), 'PPP', { locale: th })}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-gray-700">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{workout.durationMinutes} นาที</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-700">
                      <Flame className="h-4 w-4 text-orange-600" />
                      <span className="font-medium">{workout.caloriesBurned} cal</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Activity className="h-10 w-10 mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-medium">ยังไม่มีข้อมูล</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
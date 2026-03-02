'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'react-hot-toast'
import { 
  TrendingUp, 
  Activity, 
  Calendar,
  Target,
  Loader2
} from 'lucide-react'
import MonthlyChart from '@/components/charts/MonthlyChart'
import ExerciseBreakdown from '@/components/charts/ExerciseBreakdown'
import IntensityChart from '@/components/charts/IntensityChart'
import RecentWorkouts from '@/components/charts/RecentWorkouts'

export default function AnalyticsPage() {
  const { token } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [breakdownData, setBreakdownData] = useState<any[]>([])
  const [intensityData, setIntensityData] = useState<any[]>([])
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([])
  const [totalStats, setTotalStats] = useState({
    totalWorkouts: 0,
    totalCalories: 0,
    totalDuration: 0,
    averagePerWorkout: 0
  })

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const headers = { 'Authorization': `Bearer ${token}` }

      // Fetch all data in parallel
      const [monthly, breakdown, intensity, recent] = await Promise.all([
        fetch('/api/analytics/monthly', { headers }).then(r => r.json()),
        fetch('/api/analytics/breakdown', { headers }).then(r => r.json()),
        fetch('/api/analytics/intensity', { headers }).then(r => r.json()),
        fetch('/api/analytics/recent', { headers }).then(r => r.json()),
      ])

      setMonthlyData(monthly.data || [])
      setBreakdownData(breakdown.data || [])
      setIntensityData(intensity.data || [])
      setRecentWorkouts(recent.workouts || [])

      // Calculate total stats from fetched breakdown data (avoid stale state)
      const fetchedBreakdown = breakdown.data || []
      const totalWorkouts = fetchedBreakdown.reduce((sum: number, item: any) => sum + (item.count || 0), 0)
      const totalCalories = fetchedBreakdown.reduce((sum: number, item: any) => sum + (item.calories || 0), 0)
      const totalDuration = fetchedBreakdown.reduce((sum: number, item: any) => sum + (item.duration || 0), 0)

      setTotalStats({
        totalWorkouts,
        totalCalories: Math.round(totalCalories),
        totalDuration,
        averagePerWorkout: totalWorkouts > 0 ? Math.round(totalCalories / totalWorkouts) : 0
      })

    } catch (error) {
      console.error('Fetch analytics error:', error)
      toast.error('ไม่สามารถโหลดข้อมูลได้')
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    suffix = '',
    color = 'from-indigo-500 to-indigo-600'
  }: any) => (
    <Card className={`relative overflow-hidden border-0 bg-gradient-to-br ${color} text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
      <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
        <CardTitle className="text-sm font-semibold text-white/90">
          {title}
        </CardTitle>
        <Icon className="h-5 w-5 text-white/70" />
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-3xl font-bold text-white">
          {value.toLocaleString()}{suffix}
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">📊 สถิติและการวิเคราะห์</h1>
        <p className="text-gray-600 mt-1">
          ภาพรวมและวิเคราะห์การออกกำลังกายของคุณ
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-fadeInUp">
        <StatCard
          title="จำนวนครั้งทั้งหมด"
          value={totalStats.totalWorkouts}
          icon={Activity}
          color="from-blue-500 to-blue-600"
        />
        <StatCard
          title="แคลอรี่ทั้งหมด"
          value={totalStats.totalCalories}
          icon={TrendingUp}
          suffix=" cal"
          color="from-orange-500 to-orange-600"
        />
        <StatCard
          title="เวลาทั้งหมด"
          value={Math.floor(totalStats.totalDuration / 60)}
          icon={Calendar}
          suffix=" ชม."
          color="from-green-500 to-green-600"
        />
        <StatCard
          title="ค่าเฉลี่ย/ครั้ง"
          value={totalStats.averagePerWorkout}
          icon={Target}
          suffix=" cal"
          color="from-purple-500 to-purple-600"
        />
      </div>

      {/* Monthly Chart */}
      <MonthlyChart data={monthlyData} />

      {/* Two Columns */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ExerciseBreakdown data={breakdownData} />
        <IntensityChart data={intensityData} />
      </div>

      {/* Recent Workouts */}
      <RecentWorkouts workouts={recentWorkouts} />

      {/* Achievement Section */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-white">
        <CardHeader>
          <CardTitle className="text-2xl">🎖️ ความสำเร็จของคุณ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl text-center">
              <p className="text-3xl font-bold">{totalStats.totalWorkouts}</p>
              <p className="text-sm text-white/80">ครั้งออกกำลังกาย</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl text-center">
              <p className="text-3xl font-bold">{Math.floor(totalStats.totalDuration / 60)}</p>
              <p className="text-sm text-white/80">ชั่วโมงออกกำลังกาย</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl text-center">
              <p className="text-3xl font-bold">{totalStats.totalCalories}</p>
              <p className="text-sm text-white/80">แคลอรี่เผาผลาญ</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl text-center">
              <p className="text-3xl font-bold">🔥</p>
              <p className="text-sm text-white/80">ที่ตั้งเป้าหมาย</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="text-base text-blue-900">🏆 สถิติที่น่าสนใจ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm p-2 bg-white/50 rounded-lg">
              <span className="text-gray-700">ประเภทที่ชอบที่สุด:</span>
              <span className="font-bold text-blue-600">
                {breakdownData[0]?.exerciseType || '-'}
              </span>
            </div>
            <div className="flex justify-between text-sm p-2 bg-white/50 rounded-lg">
              <span className="text-gray-700">เวลาเฉลี่ย/ครั้ง:</span>
              <span className="font-bold text-blue-600">
                {totalStats.totalWorkouts > 0 
                  ? Math.round(totalStats.totalDuration / totalStats.totalWorkouts)
                  : 0} นาที
              </span>
            </div>
            <div className="flex justify-between text-sm p-2 bg-white/50 rounded-lg">
              <span className="text-gray-700">ความหนักที่ชอบ:</span>
              <span className="font-bold text-blue-600">
                {intensityData.sort((a, b) => b.count - a.count)[0]?.intensity === 'low' ? 'เบา' :
                 intensityData.sort((a, b) => b.count - a.count)[0]?.intensity === 'medium' ? 'ปานกลาง' :
                 intensityData.sort((a, b) => b.count - a.count)[0]?.intensity === 'high' ? 'หนัก' : '-'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-yellow-50">
          <CardHeader>
            <CardTitle className="text-base text-orange-900">📅 สถิติรายเดือน</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm p-2 bg-white/50 rounded-lg">
              <span className="text-gray-700">เดือนนี้:</span>
              <span className="font-bold text-orange-600">
                {monthlyData[monthlyData.length - 1]?.workouts || 0} ครั้ง
              </span>
            </div>
            <div className="flex justify-between text-sm p-2 bg-white/50 rounded-lg">
              <span className="text-gray-700">แคลอรี่เดือนนี้:</span>
              <span className="font-bold text-orange-600">
                {Math.round(monthlyData[monthlyData.length - 1]?.calories || 0)} cal
              </span>
            </div>
            <div className="flex justify-between text-sm p-2 bg-white/50 rounded-lg">
              <span className="text-gray-700">เฉลี่ย 6 เดือน:</span>
              <span className="font-bold text-orange-600">
                {monthlyData.length > 0
                  ? Math.round(
                      monthlyData.reduce((sum, m) => sum + m.workouts, 0) / monthlyData.length
                    )
                  : 0} ครั้ง/เดือน
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="text-base text-green-900">🎯 เป้าหมาย</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700 font-medium">เป้าหมายรายสัปดาห์:</span>
                <span className="font-bold text-green-600">4/5 ครั้ง</span>
              </div>
              <div className="h-3 bg-gray-300 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500" style={{ width: '80%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">แคลอรี่รายสัปดาห์:</span>
                <span className="font-semibold">1200/1500 cal</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500" style={{ width: '80%' }} />
              </div>
            </div>
            <p className="text-xs text-gray-500 italic">
              *ฟีเจอร์เป้าหมายจะเปิดใช้งานเร็วๆ นี้
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
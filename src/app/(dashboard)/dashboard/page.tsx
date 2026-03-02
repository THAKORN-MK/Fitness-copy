'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/store/authStore'
import { Activity, Flame, Clock, TrendingUp, TrendingDown, Plus } from 'lucide-react'
import Link from 'next/link'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { toast } from 'react-hot-toast'

interface Stats {
  total: {
    workouts: number
    calories: number
    duration: number
    distance: number
  }
  thisWeek: {
    workouts: number
    calories: number
    duration: number
  }
  changes: {
    workouts: number
    calories: number
    duration: number
  }
}

interface ChartData {
  date: string
  label: string
  calories: number
  workouts: number
}

export default function DashboardPage() {
  const { user, token } = useAuthStore()
  const [stats, setStats] = useState<Stats | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch summary stats
      const statsRes = await fetch('/api/stats/summary', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }
      
      // Fetch chart data
      const chartRes = await fetch('/api/stats/chart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (chartRes.ok) {
        const chartResponse = await chartRes.json()
        setChartData(chartResponse.data)
      }
      
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('ไม่สามารถโหลดข้อมูลได้')
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    change, 
    suffix = '',
    gradient = 'from-blue-500 to-blue-600'
  }: { 
    title: string
    value: number
    icon: any
    change?: number
    suffix?: string
    gradient?: string
  }) => (
    <Card className={`relative overflow-hidden border-0 bg-gradient-to-br ${gradient} text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
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
        {change !== undefined && (
          <p className={`text-xs flex items-center gap-1 mt-2 ${
            change >= 0 ? 'text-green-200' : 'text-red-200'
          }`}>
            {change >= 0 ? (
              <TrendingUp size={12} />
            ) : (
              <TrendingDown size={12} />
            )}
            {Math.abs(change)}% จากสัปดาห์ที่แล้ว
          </p>
        )}
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            สวัสดี, {user?.name || user?.username}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            ติดตามความก้าวหน้าการออกกำลังกายของคุณ
          </p>
        </div>
        <Link href="/workouts/new">
          <Button className="gap-2">
            <Plus size={20} />
            เพิ่มการออกกำลังกาย
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-fadeInUp">
        <StatCard
          title="การออกกำลังกายทั้งหมด"
          value={stats?.total.workouts || 0}
          icon={Activity}
          change={stats?.changes.workouts}
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard
          title="แคลอรี่ที่เผาผลาญ"
          value={stats?.total.calories || 0}
          icon={Flame}
          change={stats?.changes.calories}
          suffix=" cal"
          gradient="from-orange-500 to-orange-600"
        />
        <StatCard
          title="เวลาออกกำลังกาย"
          value={stats?.total.duration || 0}
          icon={Clock}
          change={stats?.changes.duration}
          suffix=" นาที"
          gradient="from-green-500 to-green-600"
        />
      </div>

      {/* Chart */}
      <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-lg">📊 แคลอรี่รายวัน (7 วันล่าสุด)</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />\n                <XAxis 
                  dataKey="label" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => [`${value ?? 0} cal`, 'แคลอรี่']}
                />
                <Line 
                  type="monotone" 
                  dataKey="calories" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Activity className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>ยังไม่มีข้อมูลการออกกำลังกาย</p>
                <Link href="/workouts/new">
                  <Button className="mt-4" variant="outline">
                    เริ่มบันทึกเลย
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <Link href="/workouts/new">
          <Button className="w-full h-12 rounded-xl gap-2">
            <Plus className="h-5 w-5" />
            <span>เพิ่มการออกกำลังกาย</span>
          </Button>
        </Link>
        <Link href="/goals">
          <Button variant="secondary" className="w-full h-12 rounded-xl gap-2">
            🎯 ตั้งเป้าหมาย
          </Button>
        </Link>
        <Link href="/analytics">
          <Button variant="secondary" className="w-full h-12 rounded-xl gap-2">
            📊 ดูสถิติ
          </Button>
        </Link>
        <Link href="/profile">
          <Button variant="secondary" className="w-full h-12 rounded-xl gap-2">
            👤 โปรไฟล์
          </Button>
        </Link>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="text-blue-900">📅 สัปดาห์นี้</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
              <span className="text-sm text-gray-700 font-medium">การออกกำลังกาย</span>
              <span className="text-2xl font-bold text-blue-600">{stats?.thisWeek.workouts || 0}</span>
              <span className="text-xs text-gray-500">ครั้ง</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
              <span className="text-sm text-gray-700 font-medium">แคลอรี่</span>
              <span className="text-2xl font-bold text-orange-600">{stats?.thisWeek.calories.toLocaleString() || 0}</span>
              <span className="text-xs text-gray-500">cal</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
              <span className="text-sm text-gray-700 font-medium">เวลา</span>
              <span className="text-2xl font-bold text-green-600">{stats?.thisWeek.duration || 0}</span>
              <span className="text-xs text-gray-500">นาที</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="text-purple-900">🏆 สถิติรวม</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
              <span className="text-sm text-gray-700 font-medium">ระยะทางรวม</span>
              <span className="text-2xl font-bold text-cyan-600">{stats?.total.distance.toFixed(2) || 0}</span>
              <span className="text-xs text-gray-500">km</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
              <span className="text-sm text-gray-700 font-medium">เวลารวม</span>
              <span className="text-2xl font-bold text-indigo-600">
                {Math.floor((stats?.total.duration || 0) / 60)}
              </span>
              <span className="text-xs text-gray-500">ชั่วโมง</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
              <span className="text-sm text-gray-700 font-medium">ค่าเฉลี่ย/ครั้ง</span>
              <span className="text-2xl font-bold text-pink-600">
                {stats?.total.workouts ? Math.round(stats.total.calories / stats.total.workouts) : 0}
              </span>
              <span className="text-xs text-gray-500">cal</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Motivational Section */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 text-white">
        <CardHeader>
          <CardTitle className="text-2xl">💪 คุณกำลังทำได้ดี!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/90 mb-4">
            ยอดเยี่ยม! ทำให้สุขภาพของคุณดีขึ้นทุกวัน ความพยายามของคุณจะนำไปสู่ผลลัพธ์ที่ยอดเยี่ยม
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/80">บันทึก: {stats?.total.workouts || 0} ครั้ง</span>
            <Link href="/workouts/new">
              <Button className="bg-white text-orange-600 hover:bg-gray-100">
                เพิ่มการออกกำลังกายเลย →
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

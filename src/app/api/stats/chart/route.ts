import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader } from '@/lib/auth'
import { format, subDays } from 'date-fns'
import { th } from 'date-fns/locale'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = getTokenFromHeader(authHeader)
    
    if (!token) {
      return NextResponse.json(
        { error: 'ไม่พบ token' },
        { status: 401 }
      )
    }
    
    const { userId } = verifyToken(token)
    
    // Get workouts from last 7 days
    const sevenDaysAgo = subDays(new Date(), 6)
    
    const workouts = await prisma.workout.findMany({
      where: {
        userId,
        exerciseDate: {
          gte: sevenDaysAgo
        }
      },
      select: {
        exerciseDate: true,
        caloriesBurned: true,
      }
    })
    
    // Group by date
    const chartData = []
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i)
      const dateStr = format(date, 'yyyy-MM-dd')
      
      const dayWorkouts = workouts.filter(w => 
        format(new Date(w.exerciseDate), 'yyyy-MM-dd') === dateStr
      )
      
      const totalCalories = dayWorkouts.reduce(
        (sum, w) => sum + Number(w.caloriesBurned),
        0
      )
      
      chartData.push({
        date: dateStr,
        label: format(date, 'EEE', { locale: th }),
        calories: Math.round(totalCalories),
        workouts: dayWorkouts.length
      })
    }
    
    return NextResponse.json({ data: chartData })
    
  } catch (error) {
    console.error('Chart data error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}
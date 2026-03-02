import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader } from '@/lib/auth'
import { startOfMonth, endOfMonth, format, subMonths } from 'date-fns'
import { th } from 'date-fns/locale'

export async function GET(request: NextRequest) {
  try {
    const cookieToken = request.cookies.get('token')?.value
    const authHeader = request.headers.get('authorization')
    const token = cookieToken ?? getTokenFromHeader(authHeader)

    if (!token) {
      return NextResponse.json({ error: 'ไม่พบ token' }, { status: 401 })
    }

    const { userId } = verifyToken(token)
    
    // Get last 6 months
    const monthsData: any[] = []
    
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i)
      const start = startOfMonth(date)
      const end = endOfMonth(date)
      
      // Get workouts for this month
      const workouts = await prisma.workout.findMany({
        where: {
          userId,
          exerciseDate: {
            gte: start,
            lte: end
          }
        },
        select: {
          caloriesBurned: true,
          durationMinutes: true,
          distanceKm: true,
        }
      })
      
      const stats = workouts.reduce((acc, w) => ({
        calories: acc.calories + Number(w.caloriesBurned ?? 0),
        duration: acc.duration + (w.durationMinutes ?? 0),
        distance: acc.distance + Number(w.distanceKm ?? 0),
      }), { calories: 0, duration: 0, distance: 0 })
      
      monthsData.push({
        month: format(date, 'MMM', { locale: th }),
        fullMonth: format(date, 'MMMM yyyy', { locale: th }),
        workouts: workouts.length,
        ...stats
      })
    }
    
    return NextResponse.json({ data: monthsData })
    
  } catch (error) {
    console.error('Monthly analytics error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

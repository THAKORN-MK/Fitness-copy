import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader } from '@/lib/auth'
import { format, subDays, parseISO, eachDayOfInterval } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import { th } from 'date-fns/locale'

// ── timezone ของ user — ปรับตาม server env หรือรับจาก frontend ──
const TZ = process.env.APP_TIMEZONE ?? 'Asia/Bangkok'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = getTokenFromHeader(authHeader)

    if (!token) {
      return NextResponse.json({ error: 'ไม่พบ token' }, { status: 401 })
    }

    const { userId } = verifyToken(token)

    const { searchParams } = new URL(request.url)
    const startParam = searchParams.get('startDate')
    const endParam   = searchParams.get('endDate')

    const startDate = startParam ? parseISO(startParam) : subDays(new Date(), 6)
    const endDate   = endParam   ? parseISO(endParam)   : new Date()
    endDate.setHours(23, 59, 59, 999)

    const workouts = await prisma.workout.findMany({
      where: {
        userId,
        exerciseDate: { gte: startDate, lte: endDate },
      },
      select: {
        exerciseDate:    true,
        caloriesBurned:  true,
        durationMinutes: true,
      },
    })

    const days = eachDayOfInterval({ start: startDate, end: endDate })

    const chartData = days.map((date) => {
      const dateStr = format(date, 'yyyy-MM-dd')

      const dayWorkouts = workouts.filter((w) => {
        // แปลง exerciseDate (UTC) → local date string ด้วย timezone ที่ถูกต้อง
        const localDate = formatInTimeZone(new Date(w.exerciseDate), TZ, 'yyyy-MM-dd')
        return localDate === dateStr
      })

      const totalCalories = dayWorkouts.reduce((sum, w) => sum + Number(w.caloriesBurned ?? 0), 0)
      const totalDuration = dayWorkouts.reduce((sum, w) => sum + Number(w.durationMinutes ?? 0), 0)

      return {
        date:     dateStr,
        label:    format(date, 'EEE', { locale: th }),
        calories: Math.round(totalCalories),
        duration: totalDuration,
        workouts: dayWorkouts.length,
      }
    })

    return NextResponse.json({ data: chartData })

  } catch (error) {
    console.error('Chart data error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = getTokenFromHeader(authHeader)
    if (!token) return NextResponse.json({ error: 'ไม่พบ token' }, { status: 401 })

    const { userId } = verifyToken(token)

    // รับ weekStartsOn และ weekStart จาก query (ส่งมาจาก frontend)
    const { searchParams } = new URL(request.url)
    const weekStartsOn = searchParams.get('weekStartsOn') ?? 'monday'  // 'monday' | 'sunday'
    const weekStartParam = searchParams.get('weekStart')                 // YYYY-MM-DD

    // คำนวณวันเริ่มต้นสัปดาห์นี้
    let thisWeekStart: Date
    if (weekStartParam) {
      thisWeekStart = new Date(weekStartParam + 'T00:00:00.000Z')
    } else {
      const today = new Date()
      const startDay = weekStartsOn === 'sunday' ? 0 : 1
      const back = (today.getDay() - startDay + 7) % 7
      thisWeekStart = new Date(today)
      thisWeekStart.setDate(today.getDate() - back)
      thisWeekStart.setHours(0, 0, 0, 0)
    }

    const thisWeekEnd = new Date(thisWeekStart)
    thisWeekEnd.setDate(thisWeekStart.getDate() + 7)

    // สัปดาห์ที่แล้ว
    const lastWeekStart = new Date(thisWeekStart)
    lastWeekStart.setDate(thisWeekStart.getDate() - 7)
    const lastWeekEnd = new Date(thisWeekStart)

    // ── Total stats ──────────────────────────────────
    const [totalWorkouts, totalAgg] = await Promise.all([
      prisma.workout.count({ where: { userId } }),
      prisma.workout.aggregate({
        where: { userId },
        _sum: { caloriesBurned: true, durationMinutes: true, distanceKm: true }
      })
    ])

    // ── This week ────────────────────────────────────
    const [thisWeekCount, thisWeekAgg] = await Promise.all([
      prisma.workout.count({
        where: { userId, exerciseDate: { gte: thisWeekStart, lt: thisWeekEnd } }
      }),
      prisma.workout.aggregate({
        where: { userId, exerciseDate: { gte: thisWeekStart, lt: thisWeekEnd } },
        _sum: { caloriesBurned: true, durationMinutes: true }
      })
    ])

    // ── Last week ────────────────────────────────────
    const [lastWeekCount, lastWeekAgg] = await Promise.all([
      prisma.workout.count({
        where: { userId, exerciseDate: { gte: lastWeekStart, lt: lastWeekEnd } }
      }),
      prisma.workout.aggregate({
        where: { userId, exerciseDate: { gte: lastWeekStart, lt: lastWeekEnd } },
        _sum: { caloriesBurned: true, durationMinutes: true }
      })
    ])

    const thisW = {
      workouts: thisWeekCount,
      calories: Number(thisWeekAgg._sum.caloriesBurned) || 0,
      duration: thisWeekAgg._sum.durationMinutes || 0,
    }
    const lastW = {
      workouts: lastWeekCount,
      calories: Number(lastWeekAgg._sum.caloriesBurned) || 0,
      duration: lastWeekAgg._sum.durationMinutes || 0,
    }

    // diff = ค่าจริง (ไม่ใช่ % เพื่อให้ frontend คำนวณแสดงได้ทั้งตัวเลขและ %)
    const diff = {
      workouts: thisW.workouts - lastW.workouts,
      calories: thisW.calories - lastW.calories,
      duration: thisW.duration - lastW.duration,
    }

    const pct = (curr: number, prev: number) =>
      prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 100)

    const changes = {
      workouts: pct(thisW.workouts, lastW.workouts),
      calories: pct(thisW.calories, lastW.calories),
      duration: pct(thisW.duration, lastW.duration),
    }

    return NextResponse.json({
      total: {
        workouts: totalWorkouts,
        calories: Number(totalAgg._sum.caloriesBurned) || 0,
        duration: totalAgg._sum.durationMinutes || 0,
        distance: Number(totalAgg._sum.distanceKm) || 0,
      },
      thisWeek: thisW,
      lastWeek: lastW,
      diff,      // ← ต่างจากสัปดาห์ที่แล้วเป็นตัวเลข
      changes,   // ← ต่างเป็น %
    })

  } catch (error) {
    console.error('Stats summary error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
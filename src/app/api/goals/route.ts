import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader } from '@/lib/auth'
import { z } from 'zod'
import { startOfDay, endOfDay, parseISO, isAfter } from 'date-fns'

const goalSchema = z.object({
  title:       z.string().min(1, 'กรุณากรอกชื่อเป้าหมาย').max(100),
  description: z.string().optional().nullable(),
  targetType:  z.enum(['workouts', 'calories', 'duration', 'distance']),
  targetValue: z.number().min(1, 'ค่าเป้าหมายต้องมากกว่า 0'),
  startDate:   z.string().min(1, 'กรุณาระบุวันเริ่มต้น'),
  endDate:     z.string().min(1, 'กรุณาระบุวันเสร็จสิ้น'),
})

function authToken(request: NextRequest) {
  const cookie = request.cookies.get('token')?.value
  const header = request.headers.get('authorization')
  return cookie ?? getTokenFromHeader(header)
}

// ── GET — list goals ──────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const token = authToken(request)
    if (!token) return NextResponse.json({ error: 'ไม่พบ token' }, { status: 401 })

    const { userId } = verifyToken(token)
    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get('status') || 'all'

    const where: any = { userId }
    if (statusFilter !== 'all') where.status = statusFilter

    const goals = await prisma.goal.findMany({
      where,
      orderBy: [{ status: 'asc' }, { endDate: 'asc' }],
    })

    const now = new Date()
    const goalsWithProgress = await Promise.all(goals.map(async (g) => {
      const targetNum = Number(g.targetValue ?? 0)

      // ── ถ้า completed แล้ว → ไม่ต้อง aggregate ใหม่ คืน targetValue ตรงๆ
      if (g.status === 'completed') {
        return {
          ...g,
          currentValue: targetNum,
          progress: 100,
        }
      }

      // ── ถ้า failed แล้ว → aggregate ตามจริง แต่ไม่ต้อง auto-resolve อีก
      const agg = await prisma.workout.aggregate({
        where: {
          userId,
          exerciseDate: { gte: g.startDate, lte: g.endDate }
        },
        _count: { id: true },
        _sum:   { caloriesBurned: true, durationMinutes: true, distanceKm: true }
      })

      let currentValue = 0
      switch (g.targetType) {
        case 'workouts': currentValue = agg._count?.id ?? 0;                    break
        case 'calories': currentValue = Number(agg._sum?.caloriesBurned  ?? 0); break
        case 'duration': currentValue = Number(agg._sum?.durationMinutes ?? 0); break
        case 'distance': currentValue = Number(agg._sum?.distanceKm      ?? 0); break
      }

      const pct    = targetNum > 0 ? Math.min(100, (currentValue / targetNum) * 100) : 0
      const isOver = now > new Date(g.endDate)

      // auto-resolve: active → completed/failed
      let resolvedStatus = g.status
      if (g.status === 'active') {
        if (pct >= 100)  resolvedStatus = 'completed'
        else if (isOver) resolvedStatus = 'failed'
      }

      // persist status change
      if (resolvedStatus !== g.status) {
        await prisma.goal.update({
          where: { id: g.id },
          data:  { status: resolvedStatus as any }
        }).catch(() => {})

        // ถ้าเพิ่ง completed → cap currentValue ที่ target
        if (resolvedStatus === 'completed') {
          return {
            ...g,
            status: 'completed',
            currentValue: targetNum,
            progress: 100,
          }
        }
      }

      return {
        ...g,
        status: resolvedStatus,
        currentValue,
        progress: Math.round(pct * 100) / 100,
      }
    }))

    return NextResponse.json({ goals: goalsWithProgress })

  } catch (err) {
    console.error('Get goals error:', err)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// ── POST — create goal ────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const token = authToken(request)
    if (!token) return NextResponse.json({ error: 'ไม่พบ token' }, { status: 401 })

    const { userId } = verifyToken(token)
    const body = await request.json()
    const data = goalSchema.parse(body)

    const startDate = startOfDay(parseISO(data.startDate))
    const endDate   = endOfDay(parseISO(data.endDate))

    if (isAfter(startDate, endDate)) {
      return NextResponse.json(
        { error: 'วันเสร็จสิ้นต้องหลังวันเริ่มต้น' },
        { status: 400 }
      )
    }

    const goal = await prisma.goal.create({
      data: {
        userId,
        title:       data.title,
        description: data.description,
        targetType:  data.targetType,
        targetValue: data.targetValue,
        period:      'custom',
        startDate,
        endDate,
        status: 'active',
      }
    })

    return NextResponse.json({ message: 'สร้างเป้าหมายสำเร็จ', goal }, { status: 201 })

  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง', details: err.issues }, { status: 400 })
    }
    console.error('Create goal error:', err)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
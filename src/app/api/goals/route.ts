import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader } from '@/lib/auth'
import { z } from 'zod'
import { startOfDay, endOfDay, addDays, addWeeks, addMonths } from 'date-fns'

const goalSchema = z.object({
  title: z.string().min(1, 'กรุณากรอกชื่อเป้าหมาย').max(100),
  description: z.string().optional().nullable(),
  targetType: z.enum(['workouts', 'calories', 'duration', 'distance']),
  targetValue: z.number().min(1, 'ค่าเป้าหมายต้องมากกว่า 0'),
  period: z.enum(['daily', 'weekly', 'monthly']),
})

// GET - List all goals
export async function GET(request: NextRequest) {
  try {
    const cookieToken = request.cookies.get('token')?.value
    const authHeader = request.headers.get('authorization')
    const token = cookieToken ?? getTokenFromHeader(authHeader)

    if (!token) {
      return NextResponse.json({ error: 'ไม่พบ token' }, { status: 401 })
    }

    const { userId } = verifyToken(token)
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'
    
    const where: any = { userId }
    if (status !== 'all') {
      where.status = status
    }
    
    const goals = await prisma.goal.findMany({
      where,
      orderBy: [
        { status: 'asc' },
        { endDate: 'asc' }
      ]
    })

    // Compute current progress for each goal based on workouts in the goal period
    const goalsWithProgress = await Promise.all(goals.map(async (g) => {
      const whereWorkout: any = {
        userId,
        exerciseDate: {
          gte: g.startDate,
          lte: g.endDate,
        }
      }

      // Aggregate relevant stats
      const agg = await prisma.workout.aggregate({
        where: whereWorkout,
        _count: { id: true },
        _sum: {
          caloriesBurned: true,
          durationMinutes: true,
          distanceKm: true,
        }
      })

      let currentValue = 0
      switch (g.targetType) {
        case 'workouts':
          currentValue = agg._count?.id ?? 0
          break
        case 'calories':
          currentValue = Number(agg._sum?.caloriesBurned ?? 0)
          break
        case 'duration':
          currentValue = Number(agg._sum?.durationMinutes ?? 0)
          break
        case 'distance':
          currentValue = Number(agg._sum?.distanceKm ?? 0)
          break
        default:
          currentValue = 0
      }

      const targetNumber = Number(g.targetValue ?? 0)
      const progress = targetNumber > 0 ? Math.min(100, (Number(currentValue) / targetNumber) * 100) : 0

      return {
        ...g,
        currentValue,
        progress: Math.round(progress * 100) / 100, // two decimals
      }
    }))

    return NextResponse.json({ goals: goalsWithProgress })
    
  } catch (error) {
    console.error('Get goals error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// POST - Create new goal
export async function POST(request: NextRequest) {
  try {
    const cookieToken = request.cookies.get('token')?.value
    const authHeader = request.headers.get('authorization')
    const token = cookieToken ?? getTokenFromHeader(authHeader)

    if (!token) {
      return NextResponse.json({ error: 'ไม่พบ token' }, { status: 401 })
    }

    const { userId } = verifyToken(token)
    const body = await request.json()
    
    const validatedData = goalSchema.parse(body)
    
    const startDate = startOfDay(new Date())
    let endDate: Date
    
    switch (validatedData.period) {
      case 'daily':
        endDate = endOfDay(new Date())
        break
      case 'weekly':
        endDate = endOfDay(addWeeks(new Date(), 1))
        break
      case 'monthly':
        endDate = endOfDay(addMonths(new Date(), 1))
        break
      default:
        endDate = endOfDay(addWeeks(new Date(), 1))
    }
    
    const goal = await prisma.goal.create({
      data: {
        userId,
        title: validatedData.title,
        description: validatedData.description,
        targetType: validatedData.targetType,
        targetValue: validatedData.targetValue,
        period: validatedData.period,
        startDate,
        endDate,
      }
    })
    
    return NextResponse.json(
      { message: 'สร้างเป้าหมายสำเร็จ', goal },
      { status: 201 }
    )
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'ข้อมูลไม่ถูกต้อง', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Create goal error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
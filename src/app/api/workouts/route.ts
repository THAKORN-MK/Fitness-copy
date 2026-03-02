import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader } from '@/lib/auth'
import { z } from 'zod'

// Validation schema
const workoutSchema = z.object({
  exerciseType: z.string().min(1, 'กรุณาเลือกประเภทการออกกำลังกาย'),
  durationMinutes: z.number().min(1, 'ระยะเวลาต้องมากกว่า 0').max(1440),
  caloriesBurned: z.number().min(0).max(9999.99),
  distanceKm: z.number().min(0).max(999.99).optional().nullable(),
  intensity: z.enum(['low', 'medium', 'high']).default('medium'),
  notes: z.string().optional().nullable(),
  exerciseDate: z.string().datetime(),
})

// GET - List all workouts
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = getTokenFromHeader(authHeader)
    
    if (!token) {
      return NextResponse.json({ error: 'ไม่พบ token' }, { status: 401 })
    }
    
    const { userId } = verifyToken(token)
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const exerciseType = searchParams.get('exerciseType')
    const sortBy = searchParams.get('sortBy') || 'exerciseDate'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    
    // Build where clause
    const where: any = { userId }
    if (exerciseType) {
      where.exerciseType = exerciseType
    }
    
    // Get total count
    const total = await prisma.workout.count({ where })
    
    // Get workouts
    const workouts = await prisma.workout.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder
      },
      skip: (page - 1) * limit,
      take: limit,
    })
    
    return NextResponse.json({
      workouts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
    
  } catch (error) {
    console.error('Get workouts error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}

// POST - Create new workout
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = getTokenFromHeader(authHeader)
    
    if (!token) {
      return NextResponse.json({ error: 'ไม่พบ token' }, { status: 401 })
    }
    
    const { userId } = verifyToken(token)
    const body = await request.json()
    
    // Validate data
    const validatedData = workoutSchema.parse(body)
    
    // Create workout
    const workout = await prisma.workout.create({
      data: {
        userId,
        exerciseType: validatedData.exerciseType,
        durationMinutes: validatedData.durationMinutes,
        caloriesBurned: validatedData.caloriesBurned,
        distanceKm: validatedData.distanceKm,
        intensity: validatedData.intensity,
        notes: validatedData.notes,
        exerciseDate: new Date(validatedData.exerciseDate),
      }
    })
    
    return NextResponse.json(
      { message: 'บันทึกสำเร็จ', workout },
      { status: 201 }
    )
    
  } catch (error) {
    if (error instanceof z.ZodError) {
  return NextResponse.json(
    { error: 'ข้อมูลไม่ถูกต้อง', details: error.issues },
    { status: 400 }
  )
}
    
    console.error('Create workout error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}

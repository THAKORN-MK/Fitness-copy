import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader } from '@/lib/auth'
import { z } from 'zod'

const workoutSchema = z.object({
  exerciseType: z.string().min(1),
  durationMinutes: z.number().min(1).max(1440),
  caloriesBurned: z.number().min(0).max(9999.99),
  distanceKm: z.number().min(0).max(999.99).optional().nullable(),
  intensity: z.enum(['low', 'medium', 'high']),
  notes: z.string().optional().nullable(),
  exerciseDate: z.string().min(1), // ✅ แก้: รับทั้ง local และ ISO string
})

// GET - Get single workout
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;

  try {
    const authHeader = request.headers.get('authorization')
    const token = getTokenFromHeader(authHeader)
    
    if (!token) {
      return NextResponse.json({ error: 'ไม่พบ token' }, { status: 401 })
    }
    
    const { userId } = verifyToken(token)
    
    const workout = await prisma.workout.findFirst({
      where: {
        id: params.id,
        userId
      }
    })
    
    if (!workout) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูล' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ workout })
    
  } catch (error) {
    console.error('Get workout error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}

// PUT - Update workout
export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;

  try {
    const authHeader = request.headers.get('authorization')
    const token = getTokenFromHeader(authHeader)
    
    if (!token) {
      return NextResponse.json({ error: 'ไม่พบ token' }, { status: 401 })
    }
    
    const { userId } = verifyToken(token)
    const body = await request.json()
    
    const existingWorkout = await prisma.workout.findFirst({
      where: {
        id: params.id,
        userId
      }
    })
    
    if (!existingWorkout) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูล' },
        { status: 404 }
      )
    }
    
    const validatedData = workoutSchema.parse(body)
    
    const workout = await prisma.workout.update({
      where: { id: params.id },
      data: {
        exerciseType: validatedData.exerciseType,
        durationMinutes: validatedData.durationMinutes,
        caloriesBurned: validatedData.caloriesBurned,
        distanceKm: validatedData.distanceKm,
        intensity: validatedData.intensity,
        notes: validatedData.notes,
        exerciseDate: new Date(validatedData.exerciseDate), // ✅ แปลงเป็น Date object
      }
    })
    
    return NextResponse.json(
      { message: 'อัปเดตสำเร็จ', workout }
    )
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'ข้อมูลไม่ถูกต้อง', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Update workout error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}

// DELETE - Delete workout
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;

  try {
    const authHeader = request.headers.get('authorization')
    const token = getTokenFromHeader(authHeader)
    
    if (!token) {
      return NextResponse.json({ error: 'ไม่พบ token' }, { status: 401 })
    }
    
    const { userId } = verifyToken(token)
    
    const existingWorkout = await prisma.workout.findFirst({
      where: {
        id: params.id,
        userId
      }
    })
    
    if (!existingWorkout) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูล' },
        { status: 404 }
      )
    }
    
    await prisma.workout.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json(
      { message: 'ลบสำเร็จ' }
    )
    
  } catch (error) {
    console.error('Delete workout error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}
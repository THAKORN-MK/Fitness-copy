import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// GET - Get user profile
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = getTokenFromHeader(authHeader)
    
    if (!token) {
      return NextResponse.json({ error: 'ไม่พบ token' }, { status: 401 })
    }
    
    const { userId } = verifyToken(token)
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
        _count: {
          select: {
            workouts: true
          }
        }
      }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'ไม่พบผู้ใช้' }, { status: 404 })
    }
    
    // Get total stats
    const stats = await prisma.workout.aggregate({
      where: { userId },
      _sum: {
        caloriesBurned: true,
        durationMinutes: true,
        distanceKm: true,
      }
    })
    
    return NextResponse.json({
      user: {
        ...user,
        totalWorkouts: user._count.workouts,
        totalCalories: Number(stats._sum.caloriesBurned) || 0,
        totalDuration: stats._sum.durationMinutes || 0,
        totalDistance: Number(stats._sum.distanceKm) || 0,
      }
    })
    
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// PUT - Update profile
const updateProfileSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อ').max(100).optional(),
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง').optional(),
  avatarUrl: z.string().url().optional().nullable(),
})

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = getTokenFromHeader(authHeader)
    
    if (!token) {
      return NextResponse.json({ error: 'ไม่พบ token' }, { status: 401 })
    }
    
    const { userId } = verifyToken(token)
    const body = await request.json()
    
    // Validate data
    const validatedData = updateProfileSchema.parse(body)
    
    // Check if email already exists (if changing email)
    if (validatedData.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: validatedData.email,
          NOT: { id: userId }
        }
      })
      
      if (existingUser) {
        return NextResponse.json(
          { error: 'อีเมลนี้ถูกใช้งานแล้ว' },
          { status: 400 }
        )
      }
    }
    
    // Update user
    const user = await prisma.user.update({
      where: { id: userId },
      data: validatedData,
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        avatarUrl: true,
      }
    })
    
    return NextResponse.json({
      message: 'อัปเดตโปรไฟล์สำเร็จ',
      user
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'ข้อมูลไม่ถูกต้อง', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
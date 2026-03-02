import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const cookieToken = request.cookies.get('token')?.value
    const authHeader = request.headers.get('authorization')
    const token = cookieToken ?? getTokenFromHeader(authHeader)

    if (!token) {
      return NextResponse.json({ error: 'ไม่พบ token' }, { status: 401 })
    }

    const { userId } = verifyToken(token)
    
    // Get all workouts grouped by exercise type
    const workouts = await prisma.workout.groupBy({
      by: ['exerciseType'],
      where: { userId },
      _count: {
        id: true
      },
      _sum: {
        caloriesBurned: true,
        durationMinutes: true,
      }
    })
    
    const breakdown = workouts.map(w => ({
      exerciseType: w.exerciseType,
      count: w._count.id,
      calories: Number(w._sum?.caloriesBurned ?? 0) || 0,
      duration: w._sum?.durationMinutes ?? 0,
    }))
    
    // Sort by count
    breakdown.sort((a, b) => b.count - a.count)
    
    return NextResponse.json({ data: breakdown })
    
  } catch (error) {
    console.error('Breakdown analytics error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}